import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { BeneficiaryRepository } from 'LegalEntities/Adapter/Database/Repository/BeneficiaryRepository';
import { InvestmentAccountsService } from 'LegalEntities/Adapter/Modules/InvestmentAccountsService';
import { BeneficiaryAccount, BeneficiaryName, BeneficiarySchema } from 'LegalEntities/Domain/Accounts/BeneficiaryAccount';
import { AccountType } from 'LegalEntities/Domain/AccountType';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export type CreateBeneficiaryInput = {
  avatar?: {
    id: string;
  };
  name?: {
    firstName: string;
    lastName: string;
  };
};

export class OpenBeneficiary {
  public static getClassName = (): string => 'OpenBeneficiary';
  private uniqueIdGenerator: IdGeneratorInterface;
  private beneficiaryRepository: BeneficiaryRepository;
  private investmentAccountService: InvestmentAccountsService;
  private transactionAdapter: TransactionalAdapter<LegalEntitiesDatabase>;

  constructor(
    uniqueIdGenerator: IdGeneratorInterface,
    beneficiaryRepository: BeneficiaryRepository,
    investmentAccountService: InvestmentAccountsService,
    transactionAdapter: TransactionalAdapter<LegalEntitiesDatabase>,
  ) {
    this.uniqueIdGenerator = uniqueIdGenerator;
    this.beneficiaryRepository = beneficiaryRepository;
    this.investmentAccountService = investmentAccountService;
    this.transactionAdapter = transactionAdapter;
  }

  public async execute(
    profileId: string,
    individualId: string,
    input: CreateBeneficiaryInput,
  ): Promise<{
    errors: ValidationErrorType[];
    accountId?: UUID;
  }> {
    const errors = [];
    try {
      if (!individualId) {
        errors.push(<ValidationErrorType>{
          type: ValidationErrorEnum.EMPTY_VALUE,
          field: 'individualAccountId',
        });
      }

      let name = null;
      let avatar = null;

      if (input?.avatar?.id) {
        avatar = Avatar.create({ id: input?.avatar?.id, path: profileId });
      }

      if (!input?.name?.firstName || !input?.name?.lastName) {
        errors.push(<ValidationErrorType>{
          type: ValidationErrorEnum.MISSING_MANDATORY_FIELDS,
          field: 'name',
        });
      } else {
        name = input.name;
      }

      if (errors.length > 0) {
        return { errors };
      }

      const accountId = this.uniqueIdGenerator.createUuid();
      const beneficiarySchema: BeneficiarySchema = {
        accountId,
        avatar: avatar ? avatar.toObject() : null,
        profileId,
        individualId,
        name: <BeneficiaryName>name,
        isArchived: false,
      };
      const beneficiaryAccount = BeneficiaryAccount.create(beneficiarySchema);

      const status = await this.transactionAdapter.transaction(`Open beneficiary account for profile ${profileId}`, async () => {
        await this.beneficiaryRepository.storeBeneficiary(beneficiaryAccount);
        const accountOpened = await this.investmentAccountService.openAccount(profileId, accountId, AccountType.BENEFICIARY);

        if (!accountOpened) {
          throw new Error(`CANNOT_OPEN_ANOTHER_ACCOUNT_OF_TYPE_BENEFICIARY`);
        }
      });

      if (!status) {
        return {
          errors: [
            <ValidationErrorType>{
              type: ValidationErrorEnum.NUMBER_OF_ACCOUNTS_EXCEEDED,
              field: 'openBeneficiaryAccount',
            },
          ],
        };
      }

      await this.beneficiaryRepository.publishEvents([
        storeEventCommand(profileId, 'BeneficiaryAccountOpened', {
          label: beneficiaryAccount.getLabel(),
          accountId,
          individualId,
        }),
      ]);

      return { accountId, errors: [] };
    } catch (error: any) {
      console.error(error);
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.UNKNOWN_ERROR,
        field: 'openBeneficiaryAccount',
      });

      return { errors };
    }
  }
}
