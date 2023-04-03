import {IdentityDocument} from "LegalEntities/Domain/ValueObject/Document";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {PersonalName, PersonalNameInput} from "LegalEntities/Domain/ValueObject/PersonalName";
import {DateOfBirth, DateOfBirthInput} from "LegalEntities/Domain/ValueObject/DateOfBirth";
import {Address, AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {Domicile, DomicileInput} from "LegalEntities/Domain/ValueObject/Domicile";
import {InvestingExperience, InvestingExperienceInput} from "LegalEntities/Domain/ValueObject/InvestingExperience";
import {SensitiveNumber, SensitiveNumberInput, SSN} from "LegalEntities/Domain/ValueObject/SensitiveNumber";
import {PersonalStatement, PersonalStatementInput} from "LegalEntities/Domain/ValueObject/PersonalStatements";
import {LegalProfileCompleted} from "LegalEntities/Domain/Events/ProfileEvents";
import {ValidationErrorEnum, ValidationErrorType} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type CompleteProfileInput = {
    name?: PersonalNameInput,
    dateOfBirth?: DateOfBirthInput,
    address?: AddressInput,
    idScan?: { id: string, fileName: string }[],
    SSN?: { ssn: SensitiveNumberInput },
    domicile?: DomicileInput,
    investingExperience?: InvestingExperienceInput,
    statements?: PersonalStatementInput[],
    removeStatements?: PersonalStatementInput[],
    verifyAndFinish: boolean
}

export class CompleteProfile {
    public static getClassName = (): string => "CompleteProfile";
    private profileRepository: ProfileRepository;

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    public async execute(input: CompleteProfileInput, profileId: string): Promise<ValidationErrorType[]> {
        let profile = await this.profileRepository.findOrCreateProfile(profileId);
        const events = [];
        const errors = [];
        if (profile.isCompleted()) {
            errors.push(<ValidationErrorType>{
                type: ValidationErrorEnum.ALREADY_COMPLETED,
                field: "profile",
            });

            return errors;
        }

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
                    case 'name':
                        profile.setName(PersonalName.create(data));
                        break;
                    case 'dateOfBirth':
                        profile.setDateOfBirth(DateOfBirth.create(data));
                        break;
                    case 'address':
                        profile.setAddress(Address.create(data));
                        break;
                    case 'idScan':
                        const documents = data.map((document: { id: string, fileName: string }) => ({
                            id: document.id,
                            fileName: document.fileName,
                            path: profileId
                        }));
                        profile.setIdentityDocument(IdentityDocument.create(documents));
                        break;
                    case 'domicile':
                        profile.setDomicile(Domicile.create(data));
                        break;
                    case 'investingExperience':
                        profile.setInvestingExperience(InvestingExperience.create(data));
                        break;
                    case 'ssn':
                        const {ssn: ssnValue} = data;
                        const ssn = SSN.createFromRawSSN(ssnValue);
                        if (await this.profileRepository.isSSNUnique(ssn, profileId)) {
                            profile.setSSN(ssn);
                        } else {
                            errors.push(<ValidationErrorType>{
                                type: ValidationErrorEnum.NOT_UNIQUE,
                                field: "ssn",
                            });
                        }
                        break;
                    case 'statements':
                        for (const rawStatement of data) {
                            const statement = PersonalStatement.create(rawStatement);
                            profile.addStatement(statement);
                        }
                        break;
                    case 'removeStatements':
                        for (const rawStatement of data) {
                            const {type} = rawStatement;
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
                    console.error(error.message);
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
                    kind: "LegalProfileCompleted",
                });
            } else {
                errors.push(<ValidationErrorType>{
                    type: ValidationErrorEnum.FAILED,
                    field: "verifyAndFinish",
                });
            }
        }

        await this.profileRepository.storeProfile(profile, events);

        return errors;
    }
}