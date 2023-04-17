import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { LegalProfileCompleted } from 'LegalEntities/Domain/Events/ProfileEvents';
import { Address, AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { DateOfBirth, DateOfBirthInput } from 'LegalEntities/Domain/ValueObject/DateOfBirth';
import { IdentityDocument } from 'LegalEntities/Domain/ValueObject/Document';
import { Domicile, DomicileInput } from 'LegalEntities/Domain/ValueObject/Domicile';
import { InvestingExperience, InvestingExperienceInput } from 'LegalEntities/Domain/ValueObject/InvestingExperience';
import { PersonalName, PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { PersonalStatement, PersonalStatementInput } from 'LegalEntities/Domain/ValueObject/PersonalStatements';
import { SensitiveNumberInput, SSN } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { DomainEvent } from 'SimpleAggregator/Types';

export type CompleteProfileInput = {
  verifyAndFinish: boolean;
  SSN?: { ssn: SensitiveNumberInput };
  address?: AddressInput;
  dateOfBirth?: DateOfBirthInput;
  domicile?: DomicileInput;
  idScan?: { fileName: string; id: string }[];
  investingExperience?: InvestingExperienceInput;
  name?: PersonalNameInput;
  removeStatements?: PersonalStatementInput[];
  statements?: PersonalStatementInput[];
};

export class CompleteProfile {
  public static getClassName = (): string => 'CompleteProfile';
  private profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  public async execute(input: CompleteProfileInput, profileId: string): Promise<ValidationErrorType[]> {
    const profile = await this.profileRepository.findOrCreateProfile(profileId);
    let events: DomainEvent[] = [];
    const errors = [];

    if (profile.isCompleted()) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.ALREADY_COMPLETED,
        field: 'profile',
      });

      return errors;
    }

    const inputKeys = Object.keys(input) as (keyof CompleteProfileInput)[];

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
          case 'investingExperience':
            profile.setInvestingExperience(InvestingExperience.create(data as InvestingExperienceInput));
            break;
          case 'SSN':
            // @ts-ignore
            const { ssn: ssnValue } = data;
            const ssn = SSN.createFromRawSSN(ssnValue);

            if (await this.profileRepository.isSSNUnique(ssn, profileId)) {
              profile.setSSN(ssn);
            } else {
              errors.push(<ValidationErrorType>{
                type: ValidationErrorEnum.NOT_UNIQUE,
                field: 'ssn',
              });
            }

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

    if (errors.length === 0 && input.verifyAndFinish) {
      if (profile.verifyCompletion()) {
        profile.setAsCompleted();
        events.push(<LegalProfileCompleted>{
          id: profileId,
          kind: 'LegalProfileCompleted',
        });
      } else {
        errors.push(<ValidationErrorType>{
          type: ValidationErrorEnum.FAILED,
          field: 'verifyAndFinish',
          details: profile.getCompletionErrors(),
        });
      }
    }

    await this.profileRepository.storeProfile(profile, events);

    return errors;
  }
}
