import { CompanyAccount } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { StakeholderToAccount } from 'LegalEntities/Domain/StakeholderToAccount';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { Stakeholder, StakeholderInput } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { Uuid, ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { AnnualRevenue, NumberOfEmployees, ValueRangeInput } from 'LegalEntities/Domain/ValueObject/ValueRange';
import { Industry, ValueStringInput } from 'LegalEntities/Domain/ValueObject/ValueString';
import { DomainEvent } from 'SimpleAggregator/Types';

type File = { fileName: string; id: string };

export type UpdateCompanyAccountInput = {
  address?: AddressInput;
  annualRevenue?: ValueRangeInput;
  avatar?: { id: string };
  companyDocuments?: File[];
  industry?: ValueStringInput;
  numberOfEmployees?: ValueRangeInput;
  removeDocuments?: File[];
  removeStakeholders?: StakeholderInput[];
  stakeholders?: StakeholderInput[];
};

abstract class UpdateCompany {
  protected async updateCompanyData(account: CompanyAccount, input: UpdateCompanyAccountInput, profileId: string) {
    const errors: any = [];
    const events: DomainEvent[] = [];

    try {
      const inputKeys = Object.keys(input) as (keyof UpdateCompanyAccountInput)[];

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
            case 'annualRevenue':
              account.setAnnualRevenue(AnnualRevenue.create(data as ValueRangeInput));
              break;
            case 'numberOfEmployees':
              account.setNumberOfEmployees(NumberOfEmployees.create(data as ValueRangeInput));
              break;
            case 'industry':
              account.setIndustry(Industry.create(data as ValueStringInput));
              break;
            case 'avatar':
              const { id } = data as { id: string };
              const removeAvatarEvent = account.replaceAvatar(Avatar.create({ id, path: profileId }));

              if (removeAvatarEvent) {
                events.push(removeAvatarEvent);
              }

              break;
            case 'companyDocuments':
              (data as File[]).map((document: File) =>
                account.addDocument({
                  id: document.id,
                  fileName: document.fileName,
                  path: profileId,
                }),
              );
              break;
            case 'removeDocuments':
              (data as File[]).map((document: File) => {
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
              events.push(...stakeholdersEvents);

              break;
            case 'removeStakeholders':
              (data as StakeholderInput[]).map((idToRemove: { id: string }) => {
                const { id } = idToRemove;
                const stakeholderRemoveEvents = account.removeStakeholder(Uuid.create(id));

                if (stakeholderRemoveEvents) {
                  events.push(...stakeholderRemoveEvents);
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
    } catch (error: any) {
      console.error(error);
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.UNKNOWN_ERROR,
        field: 'companyAccount',
      });
    }

    return {
      events,
      errors,
    };
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
export default UpdateCompany;
