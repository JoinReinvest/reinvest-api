import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { AccountType } from 'LegalEntities/Domain/AccountType';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { Employer, EmployerInput } from 'LegalEntities/Domain/ValueObject/Employer';
import { EmploymentStatus, EmploymentStatusInput } from 'LegalEntities/Domain/ValueObject/EmploymentStatus';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { NetIncome, NetWorth, ValueRangeInput } from 'LegalEntities/Domain/ValueObject/ValueRange';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export type UpdateIndividualAccountInput = {
  avatar?: { id: string };
  employer?: EmployerInput;
  employmentStatus?: EmploymentStatusInput;
  netIncome?: ValueRangeInput;
  netWorth?: ValueRangeInput;
};

export class UpdateIndividualAccount {
  public static getClassName = (): string => 'UpdateIndividualAccount';
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  public async execute(profileId: string, accountId: string, input: UpdateIndividualAccountInput): Promise<ValidationErrorType[]> {
    const errors: any = [];
    try {
      const events: DomainEvent[] = [];
      const account = await this.accountRepository.findIndividualAccount(profileId);

      if (!account) {
        return errors.push(<ValidationErrorType>{
          type: ValidationErrorEnum.NOT_FOUND,
          field: 'individualAccount',
        });
      }

      const inputKeys = Object.keys(input) as (keyof UpdateIndividualAccountInput)[];

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
              account.setEmploymentStatus(EmploymentStatus.create(data as EmploymentStatusInput));
              break;
            case 'avatar':
              const { id } = data as { id: string };
              const replacedAvatarEvent = account.replaceAvatar(Avatar.create({ id, path: profileId }));

              if (replacedAvatarEvent) {
                events.push(replacedAvatarEvent);
              }

              break;
            case 'employer':
              account.setEmployer(Employer.create(data as EmployerInput));
              break;
            case 'netWorth':
              account.setNetWorth(NetWorth.create(data as ValueRangeInput));
              break;
            case 'netIncome':
              account.setNetIncome(NetIncome.create(data as ValueRangeInput));
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

      events.push(
        storeEventCommand(profileId, 'AccountUpdated', {
          accountId,
          type: AccountType.INDIVIDUAL,
          updatedFields: inputKeys,
        }),
      );

      await this.accountRepository.updateIndividualAccount(account, events);
    } catch (error: any) {
      console.error(error);
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.UNKNOWN_ERROR,
        field: 'draft',
      });
    }

    return errors;
  }
}
