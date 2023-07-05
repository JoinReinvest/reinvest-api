import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { CompanyAccount } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { sensitiveDataUpdated, UpdatedObjectType } from 'LegalEntities/Domain/Events/ProfileEvents';
import { StakeholderToAccount } from 'LegalEntities/Domain/StakeholderToAccount';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { Stakeholder, StakeholderInput } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { Uuid, ValidationError, ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
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

export class UpdateCompany {
  public static getClassName = (): string => 'UpdateCompany';
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  async update(account: CompanyAccount, input: UpdateCompanyAccountInput, profileId: string) {
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
              events.push(sensitiveDataUpdated(UpdatedObjectType.ACCOUNT, profileId, account.getId()));
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
              events.push(sensitiveDataUpdated(UpdatedObjectType.ACCOUNT, profileId, account.getId()));
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
              events.push(sensitiveDataUpdated(UpdatedObjectType.ACCOUNT, profileId, account.getId()));
              break;
            case 'stakeholders':
              const stakeholdersEvents = await this.addStakeholder(account, data as StakeholderInput[], profileId);
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

  private async addStakeholder(account: CompanyAccount, data: StakeholderInput[], profileId: string): Promise<DomainEvent[]> {
    let events: DomainEvent[] = [];

    const stakeholderData = StakeholderToAccount.getStakeholderDataToAddToAccount(account, data, profileId);

    for (const { isNewStakeholder, stakeholderSchema } of stakeholderData) {
      const stakeholder = Stakeholder.create(stakeholderSchema);

      if (await this.accountRepository.isSensitiveNumberBanned(stakeholder.getSSN().getHash())) {
        throw new ValidationError(ValidationErrorEnum.SSN_BANNED, 'ssn', stakeholder.getSSN().getAnonymized());
      }

      const stakeholderEvents = isNewStakeholder ? account.addStakeholder(stakeholder) : account.updateStakeholder(stakeholder);

      if (stakeholderEvents) {
        events = [...events, ...stakeholderEvents];
      }

      events.push(sensitiveDataUpdated(UpdatedObjectType.ACCOUNT, profileId, account.getId()));

      if (!isNewStakeholder) {
        events.push(sensitiveDataUpdated(UpdatedObjectType.STAKEHOLDER, profileId, account.getId(), stakeholderSchema.id));
      }
    }

    return events;
  }
}
