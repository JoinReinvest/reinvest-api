import { BeneficiaryRepository } from 'LegalEntities/Adapter/Database/Repository/BeneficiaryRepository';
import type { BeneficiaryName } from 'LegalEntities/Domain/Accounts/BeneficiaryAccount';
import { Avatar } from 'LegalEntities/Domain/ValueObject/Document';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DomainEvent } from 'SimpleAggregator/Types';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { AccountType } from 'LegalEntities/Domain/AccountType';

export type UpdateBeneficiaryAccountInput = {
  avatar?: { id: string };
  name?: BeneficiaryName;
};

export class UpdateBeneficiaryAccount {
  public static getClassName = (): string => 'UpdateBeneficiaryAccount';
  private beneficiaryRepository: BeneficiaryRepository;

  constructor(beneficiaryRepository: BeneficiaryRepository) {
    this.beneficiaryRepository = beneficiaryRepository;
  }

  public async execute(profileId: string, accountId: string, input: UpdateBeneficiaryAccountInput): Promise<ValidationErrorType[]> {
    const errors: any = [];
    try {
      const events: DomainEvent[] = [];
      const beneficiaryAccount = await this.beneficiaryRepository.findBeneficiary(profileId, accountId);

      if (!beneficiaryAccount) {
        return errors.push(<ValidationErrorType>{
          type: ValidationErrorEnum.NOT_FOUND,
          field: 'beneficiaryAccount',
        });
      }

      const inputKeys = Object.keys(input) as (keyof UpdateBeneficiaryAccountInput)[];

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
              beneficiaryAccount.setName(data as BeneficiaryName);
              break;
            case 'avatar':
              const { id } = data as { id: string };
              const replacedAvatarEvent = beneficiaryAccount.replaceAvatar(Avatar.create({ id, path: profileId }));

              if (replacedAvatarEvent) {
                events.push(replacedAvatarEvent);
              }

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
          type: AccountType.BENEFICIARY,
          updatedFields: inputKeys,
        }),
      );

      await this.beneficiaryRepository.storeBeneficiary(beneficiaryAccount, events);
    } catch (error: any) {
      console.error(error);
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.UNKNOWN_ERROR,
        field: 'beneficiaryAccount',
      });
    }

    return errors;
  }
}
