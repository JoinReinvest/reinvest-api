import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { LegalProfileCompleted } from 'LegalEntities/Domain/Events/ProfileEvents';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DateOfBirth, DateOfBirthInput } from 'LegalEntities/Domain/ValueObject/DateOfBirth';
import { IdentityDocument } from 'LegalEntities/Domain/ValueObject/Document';
import { Domicile, DomicileInput } from 'LegalEntities/Domain/ValueObject/Domicile';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DomainEvent } from 'SimpleAggregator/Types';

export type UpdateProfileForVerificationInput = {
  verifyAndFinish: boolean;
  address?: AddressInput;
  dateOfBirth?: DateOfBirthInput;
  domicile?: DomicileInput;
  idScan?: { fileName: string; id: string }[];
  name?: PersonalNameInput;
};

export class UpdateProfileForVerification {
  public static getClassName = (): string => 'UpdateProfileForVerification';
  private profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  public async execute(input: UpdateProfileForVerificationInput, profileId: string): Promise<ValidationErrorType[]> {
    const profile = await this.profileRepository.findProfile(profileId);
    let events: DomainEvent[] = [];
    const errors = [];

    if (!profile?.isCompleted()) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.NOT_COMPLETED,
        field: 'profile',
      });

      return errors;
    }

    const inputKeys = Object.keys(input) as (keyof UpdateProfileForVerificationInput)[];

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
            profile.setName(PersonalName.create(data as PersonalNameInput));
            break;
          case 'dateOfBirth':
            profile.setDateOfBirth(DateOfBirth.create(data as DateOfBirthInput));
            break;
          case 'address':
            profile.setAddress(Address.create(data as AddressInput));
            break;
          case 'idScan':
            const idScan = data as { fileName: string; id: string }[];
            const documents = idScan.map((document: { fileName: string; id: string }) => ({
              id: document.id,
              fileName: document.fileName,
              path: profileId,
            }));
            const removedDocumentsEvents = profile.replaceIdentityDocumentAndReturnRemoved(IdentityDocument.create(documents));
            events = [...events, ...removedDocumentsEvents];
            break;
          case 'domicile':
            profile.setDomicile(Domicile.create(data as DomicileInput));
            break;
          case 'verifyAndFinish':
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

    await this.profileRepository.storeProfile(profile, events);

    return errors;
  }
}
