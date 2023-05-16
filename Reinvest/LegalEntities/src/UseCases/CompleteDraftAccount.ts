import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { DraftAccountRepository } from 'LegalEntities/Adapter/Database/Repository/DraftAccountRepository';
import { CompanyDraftAccount, DraftAccount, DraftAccountType, IndividualDraftAccount } from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { StakeholderToAccount } from 'LegalEntities/Domain/StakeholderToAccount';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { Company, CompanyName, CompanyNameInput, CompanyTypeInput } from 'LegalEntities/Domain/ValueObject/Company';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { Employer, EmployerInput } from 'LegalEntities/Domain/ValueObject/Employer';
import { EmploymentStatus, EmploymentStatusInput } from 'LegalEntities/Domain/ValueObject/EmploymentStatus';
import { EIN, SensitiveNumberInput } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { Stakeholder, StakeholderInput } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { Uuid, ValidationError, ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { AnnualRevenue, NetIncome, NetWorth, NumberOfEmployees, ValueRangeInput } from 'LegalEntities/Domain/ValueObject/ValueRange';
import { Industry, ValueStringInput } from 'LegalEntities/Domain/ValueObject/ValueString';
import { DomainEvent } from 'SimpleAggregator/Types';

export type IndividualDraftAccountInput = {
  avatar?: { id: string };
  employer?: EmployerInput;
  employmentStatus?: EmploymentStatusInput;
  netIncome?: ValueRangeInput;
  netWorth?: ValueRangeInput;
};

export type CompanyDraftAccountInput = {
  address?: AddressInput;
  annualRevenue?: ValueRangeInput;
  avatar?: { id: string };
  companyType?: CompanyTypeInput;
  ein?: { ein: SensitiveNumberInput };
  industry?: ValueStringInput;
  name?: CompanyNameInput;
  numberOfEmployees?: ValueRangeInput;
  removeStakeholders?: { id: string }[];
  stakeholders?: StakeholderInput[];
};

export class CompleteDraftAccount {
  public static getClassName = (): string => 'CompleteDraftAccount';
  private draftAccountRepository: DraftAccountRepository;
  private uniqueIdGenerator: IdGeneratorInterface;
  private accountRepository: AccountRepository;

  constructor(draftAccountRepository: DraftAccountRepository, uniqueIdGenerator: IdGeneratorInterface, accountRepository: AccountRepository) {
    this.draftAccountRepository = draftAccountRepository;
    this.uniqueIdGenerator = uniqueIdGenerator;
    this.accountRepository = accountRepository;
  }

  public async completeIndividual(profileId: string, draftAccountId: string, input: IndividualDraftAccountInput): Promise<ValidationErrorType[]> {
    const errors = [];
    try {
      const events: DomainEvent[] = [];
      const draft = await this.getDraftAccount<IndividualDraftAccount>(profileId, draftAccountId, DraftAccountType.INDIVIDUAL);
      const inputKeys = Object.keys(input) as (keyof IndividualDraftAccountInput)[];

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
            case 'employmentStatus':
              draft.setEmploymentStatus(EmploymentStatus.create(data as EmploymentStatusInput));
              break;
            case 'avatar':
              const { id } = data as { id: string };
              const replacedAvatarEvent = draft.replaceAvatar(Avatar.create({ id, path: profileId }));

              if (replacedAvatarEvent) {
                events.push(replacedAvatarEvent);
              }

              break;
            case 'employer':
              draft.setEmployer(Employer.create(data as EmployerInput));
              break;
            case 'netWorth':
              draft.setNetWorth(NetWorth.create(data as ValueRangeInput));
              break;
            case 'netIncome':
              draft.setNetIncome(NetIncome.create(data as ValueRangeInput));
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

      await this.draftAccountRepository.storeDraft(draft, events);
    } catch (error: any) {
      console.error(error);
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.UNKNOWN_ERROR,
        field: 'draft',
      });
    }

    return errors;
  }

  public async completeCompany(
    profileId: string,
    draftAccountId: string,
    accountType: DraftAccountType,
    input: CompanyDraftAccountInput,
  ): Promise<ValidationErrorType[]> {
    const errors = [];
    try {
      const draft = await this.getDraftAccount<CompanyDraftAccount>(profileId, draftAccountId, accountType);
      let events: DomainEvent[] = [];

      for (const step of Object.keys(input)) {
        try {
          // @ts-ignore
          const data = input[step];

          if (data === null) {
            errors.push(<ValidationErrorType>{
              type: ValidationErrorEnum.EMPTY_VALUE,
              field: step,
            });
            continue;
          }

          switch (step) {
            case 'companyName':
              draft.setCompanyName(CompanyName.create(data));
              break;
            case 'address':
              draft.setAddress(Address.create(data));
              break;
            case 'ein':
              const { ein: einValue } = data;
              const ein = EIN.createFromRawEIN(einValue);

              if (!(await this.accountRepository.isEinUnique(ein))) {
                throw new ValidationError(ValidationErrorEnum.NOT_UNIQUE, 'ein');
              }

              draft.setEIN(ein);
              break;
            case 'annualRevenue':
              draft.setAnnualRevenue(AnnualRevenue.create(data));
              break;
            case 'numberOfEmployees':
              draft.setNumberOfEmployees(NumberOfEmployees.create(data));
              break;
            case 'industry':
              draft.setIndustry(Industry.create(data));
              break;
            case 'companyType':
              draft.setCompanyType(Company.create(data));
              break;
            case 'avatar':
              const { id } = data;
              const removeAvatarEvent = draft.replaceAvatar(Avatar.create({ id, path: profileId }));

              if (removeAvatarEvent) {
                events.push(removeAvatarEvent);
              }

              break;
            case 'companyDocuments':
              data.map((document: { fileName: string; id: string }) =>
                draft.addDocument({
                  id: document.id,
                  fileName: document.fileName,
                  path: profileId,
                }),
              );
              break;
            case 'removeDocuments':
              data.map((document: { fileName: string; id: string }) => {
                const documentSchema = {
                  id: document.id,
                  fileName: document.fileName,
                  path: profileId,
                };
                const removedDocumentEvent = draft.removeDocument(documentSchema);

                if (removedDocumentEvent) {
                  events.push(removedDocumentEvent);
                }
              });
              break;
            case 'stakeholders':
              const stakeholdersEvents = this.addStakeholder(draft, data, profileId);
              events = [...events, ...stakeholdersEvents];
              break;
            case 'removeStakeholders':
              data.map((idToRemove: { id: string }) => {
                const { id } = idToRemove;
                const stakeholderRemoveEvents = draft.removeStakeholder(Uuid.create(id));

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

      await this.draftAccountRepository.storeDraft(draft, events);
    } catch (error: any) {
      console.error(error);
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.UNKNOWN_ERROR,
        field: 'draft',
      });
    }

    return errors;
  }

  private async getDraftAccount<DraftType extends DraftAccount>(profileId: string, draftAccountId: string, accountType: DraftAccountType): Promise<DraftType> {
    const draft = await this.draftAccountRepository.getDraftForProfile<DraftType>(profileId, draftAccountId);

    if (!draft.isActive()) {
      throw new ValidationError(ValidationErrorEnum.NOT_ACTIVE, 'draft');
    }

    if (!draft.isType(accountType)) {
      throw new ValidationError(ValidationErrorEnum.WRONG_TYPE, 'draft');
    }

    return draft;
  }

  private addStakeholder(account: CompanyDraftAccount, data: StakeholderInput[], profileId: string): DomainEvent[] {
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
