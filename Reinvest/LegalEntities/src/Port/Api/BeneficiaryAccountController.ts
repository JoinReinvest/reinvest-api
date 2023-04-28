import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { BeneficiaryAccount, BeneficiaryName, BeneficiarySchema } from 'LegalEntities/Domain/Accounts/BeneficiaryAccount';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';

export type CreateBeneficiaryInput = {
  avatar?: {
    id: string;
  };
  name?: {
    firstName: string;
    lastName: string;
  };
};

export class BeneficiaryAccountController {
  private uniqueIdGenerator: IdGeneratorInterface;

  constructor(
    uniqueIdGenerator: IdGeneratorInterface,
    // transformDraftIntoAccount: TransformDraftAccountIntoRegularAccount,
  ) {
    this.uniqueIdGenerator = uniqueIdGenerator;
  }

  public static getClassName = (): string => 'BeneficiaryAccountController';

  public async openBeneficiaryAccount(
    profileId: string,
    individualId: string,
    input: CreateBeneficiaryInput,
  ): Promise<{
    status: boolean;
    accountId?: string;
    errors?: ValidationErrorType[];
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
        return {
          status: false,
          errors,
        };
      }

      const accountId = this.uniqueIdGenerator.createUuid();
      const beneficiarySchema: BeneficiarySchema = {
        accountId,
        avatar: avatar ? avatar.toObject() : null,
        profileId,
        individualId,
        name: <BeneficiaryName>name,
      };

      const beneficiaryAccount = BeneficiaryAccount.create(beneficiarySchema);
      // TODO 4th of May
      // add beneficiary account db migration
      // store beneficiaryAccount in db
      // open account in individual account
      // read beneficiary account from db in ReadAccountController
      // read beneficiary account overview in getAccountsOverview

      return {
        status: true,
        accountId,
      };
    } catch (error: any) {
      console.error(error);
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.UNKNOWN_ERROR,
        field: 'openBeneficiaryAccount',
      });

      return {
        status: false,
        errors,
      };
    }
  }

  // public async transformDraftAccountIntoRegularAccount(profileId: string, draftAccountId: string): Promise<string | null> {
  //   try {
  //     return await this.transformDraftIntoAccount.execute(profileId, draftAccountId);
  //   } catch (error: any) {
  //     return error.message;
  //   }
  // }
}
