import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { CorporateType } from 'LegalEntities/Domain/ValueObject/Company';
import { IdentityDocument } from 'LegalEntities/Domain/ValueObject/Document';
import { Domicile, DomicileInput } from 'LegalEntities/Domain/ValueObject/Domicile';
import { StakeholderInput } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DomainEvent } from 'SimpleAggregator/Types';

export type UpdateCompanyForVerificationInput = {
  verifyAndFinish: boolean;
  address?: AddressInput;
  companyDocuments?: { fileName: string; id: string }[];
  companyType?: {
    type: CorporateType;
  };
  removeDocuments?: { fileName: string; id: string }[];
  removeStakeholders?: StakeholderInput[];
  stakeholders?: StakeholderInput[];
};

export class UpdateCompanyForVerification {
  public static getClassName = (): string => 'UpdateCompanyForVerification';
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  public async execute(input: UpdateCompanyForVerificationInput, accountId: string, profileId: string): Promise<ValidationErrorType[]> {
    const account = await this.accountRepository.findCompanyAccount(profileId, accountId);
    let events: DomainEvent[] = [];
    const errors = [];

    if (!account) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.NOT_COMPLETED,
        field: 'profile',
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
          case 'idScan':
            const idScan = data as { fileName: string; id: string }[];
            const documents = idScan.map((document: { fileName: string; id: string }) => ({
              id: document.id,
              fileName: document.fileName,
              path: profileId,
            }));
            console.log(documents, 'TESTTES');
            const removedDocumentsEvents = account.replaceIdentityDocumentAndReturnRemoved(IdentityDocument.create(documents));
            events = [...events, ...removedDocumentsEvents];
            break;
          case 'domicile':
            account.setDomicile(Domicile.create(data as DomicileInput));
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

    await this.accountRepository.storeProfile(account, events);

    return errors;
  }
}
