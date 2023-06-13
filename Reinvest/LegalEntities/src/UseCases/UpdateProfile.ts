import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { IdentityDocument } from 'LegalEntities/Domain/ValueObject/Document';
import { Domicile, DomicileInput } from 'LegalEntities/Domain/ValueObject/Domicile';
import { InvestingExperience, InvestingExperienceInput } from 'LegalEntities/Domain/ValueObject/InvestingExperience';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { PersonalStatement, PersonalStatementInput } from 'LegalEntities/Domain/ValueObject/PersonalStatements';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DomainEvent } from 'SimpleAggregator/Types';

type File = { fileName: string; id: string };

export type UpdateProfileInput = {
  address?: AddressInput;
  domicile?: DomicileInput;
  idScan?: File[];
  investingExperience?: InvestingExperienceInput;
  name?: PersonalNameInput;
  removeStatements?: PersonalStatementInput[];
  statements?: PersonalStatementInput[];
};

export class UpdateProfile {
  private profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  public static getClassName = (): string => 'UpdateProfile';

  public async execute(input: UpdateProfileInput, profileId: string): Promise<ValidationErrorType[]> {
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

    const inputKeys = Object.keys(input) as (keyof UpdateProfileInput)[];

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
          case 'address':
            profile.setAddress(Address.create(data as AddressInput));
            break;
          case 'idScan':
            const idScan = data as File[];
            const documents = idScan.map((document: File) => ({
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
          case 'investingExperience':
            profile.setInvestingExperience(InvestingExperience.create(data as InvestingExperienceInput));
            break;
          case 'statements':
            for (const rawStatement of data as PersonalStatementInput[]) {
              const statement = PersonalStatement.create(rawStatement);
              profile.addStatement(statement);
            }

            break;
          case 'removeStatements':
            for (const rawStatement of data as PersonalStatementInput[]) {
              const { type } = rawStatement;
              profile.removeStatement(type);
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

    await this.profileRepository.storeProfile(profile, events);

    return errors;
  }
}
