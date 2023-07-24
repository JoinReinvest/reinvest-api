import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DateOfBirth, DateOfBirthInput } from 'LegalEntities/Domain/ValueObject/DateOfBirth';
import { IdentityDocument } from 'LegalEntities/Domain/ValueObject/Document';
import { Domicile, DomicileInput, SimplifiedDomicile, SimplifiedDomicileInput } from 'LegalEntities/Domain/ValueObject/Domicile';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DomainEvent } from 'SimpleAggregator/Types';

export type UpdateStakeholderForVerificationInput = {
  address?: AddressInput;
  dateOfBirth?: DateOfBirthInput;
  domicile?: SimplifiedDomicileInput;
  idScan?: { fileName: string; id: string }[];
  name?: PersonalNameInput;
};

export class UpdateStakeholderForVerification {
  public static getClassName = (): string => 'UpdateStakeholderForVerification';
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  public async execute(
    input: UpdateStakeholderForVerificationInput,
    profileId: string,
    accountId: string,
    stakeholderId: string,
  ): Promise<ValidationErrorType[]> {
    let events: DomainEvent[] = [];
    const errors = [];
    const account = await this.accountRepository.findCompanyAccount(profileId, accountId);

    if (!account) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.NOT_FOUND,
        field: 'account',
      });

      return errors;
    }

    const stakeholder = account?.getStakeholderById(stakeholderId);

    if (!stakeholder) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.NOT_FOUND,
        field: 'stakeholder',
      });

      return errors;
    }

    const inputKeys = Object.keys(input) as (keyof UpdateStakeholderForVerificationInput)[];

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
          case 'name':
            stakeholder.setName(PersonalName.create(data as PersonalNameInput));
            break;
          case 'dateOfBirth':
            stakeholder.setDateOfBirth(DateOfBirth.create(data as DateOfBirthInput));
            break;
          case 'address':
            stakeholder.setAddress(Address.create(data as AddressInput));
            break;
          case 'idScan':
            const idScan = data as { fileName: string; id: string }[];
            const documents = idScan.map((document: { fileName: string; id: string }) => ({
              id: document.id,
              fileName: document.fileName,
              path: profileId,
            }));
            const removedDocumentsEvents = stakeholder.replaceIdentityDocumentAndReturnRemoved(IdentityDocument.create(documents));
            events = [...events, ...removedDocumentsEvents];
            break;
          case 'domicile':
            stakeholder.setDomicile(SimplifiedDomicile.create(data as SimplifiedDomicileInput));
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
}
