import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { CompanyAccount } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { StakeholderToAccount } from 'LegalEntities/Domain/StakeholderToAccount';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { Company, CompanyTypeInput, CorporateType } from 'LegalEntities/Domain/ValueObject/Company';
import { Stakeholder, StakeholderInput } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { Uuid, ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DomainEvent } from 'SimpleAggregator/Types';

type File = { fileName: string; id: string };

export type UpdateCompanyForVerificationInput = {
  address?: AddressInput;
  companyDocuments?: File[];
  companyType?: {
    type: CorporateType;
  };
  removeDocuments?: File[];
  removeStakeholders?: StakeholderInput[];
  stakeholders?: StakeholderInput[];
};

export class UpdateCompanyForVerification {
  public static getClassName = (): string => 'UpdateCompanyForVerification';
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  public async execute(input: UpdateCompanyForVerificationInput, profileId: string, accountId: string): Promise<ValidationErrorType[]> {
    const account = await this.accountRepository.findCompanyAccount(profileId, accountId);
    let events: DomainEvent[] = [];
    const errors = [];

    if (!account) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.NOT_COMPLETED,
        field: 'account',
      });

      return errors;
    }

    const inputKeys = Object.keys(input) as (keyof UpdateCompanyForVerificationInput)[];

    for (const step of inputKeys) {
      try {
        const data = input[step];

        if (data === null) {
          errors.push(<ValidationErrorType>{
            type: ValidationErrorEnum.EMPTY_VALUE,
            field: step,
          });
          continue;
        }

        switch (step) {
          case 'address':
            account.setAddress(Address.create(data as AddressInput));
            break;
          case 'companyType':
            account.setCompanyType(Company.create(data as CompanyTypeInput));
            break;
          case 'companyDocuments':
            (data as File[])?.map((document: { fileName: string; id: string }) =>
              account.addDocument({
                id: document.id,
                fileName: document.fileName,
                path: profileId,
              }),
            );
            break;
          case 'removeDocuments':
            (data as File[]).map((document: { fileName: string; id: string }) => {
              const documentSchema = {
                id: document.id,
                fileName: document.fileName,
                path: profileId,
              };
              const removedDocumentEvent = account.removeDocument(documentSchema);

              if (removedDocumentEvent) {
                events.push(removedDocumentEvent);
              }
            });
            break;
          case 'stakeholders':
            const stakeholdersEvents = this.addStakeholder(account, data as StakeholderInput[], profileId);
            events = [...events, ...stakeholdersEvents];
            break;
          case 'removeStakeholders':
            (data as StakeholderInput[]).map((idToRemove: { id: string }) => {
              const { id } = idToRemove;
              const stakeholderRemoveEvents = account.removeStakeholder(Uuid.create(id));

              if (stakeholderRemoveEvents) {
                events = [...events, ...stakeholderRemoveEvents];
              }
            });
            break;
          default:
            errors.push(<ValidationErrorType>{
              type: ValidationErrorEnum.UNKNOWN_ERROR,
              field: step,
            });
            break;
        }
      } catch (error: any) {
        if ('getValidationError' in error) {
          errors.push(error.getValidationError());
        } else {
          console.error(error);
          errors.push(<ValidationErrorType>{
            type: ValidationErrorEnum.UNKNOWN_ERROR,
            field: step,
          });
        }
      }
    }

    await this.accountRepository.updateCompanyAccount(account, events);

    return errors;
  }
  private addStakeholder(account: CompanyAccount, data: StakeholderInput[], profileId: string): DomainEvent[] {
    let events: DomainEvent[] = [];

    const stakeholderData = StakeholderToAccount.getStakeholderDataToAddToAccount(account, data, profileId);

    stakeholderData.map(({ isNewStakeholder, stakeholderSchema }) => {
      const stakeholderEvents = isNewStakeholder
        ? account.addStakeholder(Stakeholder.create(stakeholderSchema))
        : account.updateStakeholder(Stakeholder.create(stakeholderSchema));

      if (stakeholderEvents) {
        events = [...events, ...stakeholderEvents];
      }
    });

    return events;
  }
}
