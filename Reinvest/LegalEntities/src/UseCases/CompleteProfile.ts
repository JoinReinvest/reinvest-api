import {IdentityDocument} from "LegalEntities/Domain/ValueObject/Document";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {PersonalName, PersonalNameInput} from "LegalEntities/Domain/ValueObject/PersonalName";
import {DateOfBirth, DateOfBirthInput} from "LegalEntities/Domain/ValueObject/DateOfBirth";
import {Address, AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {Domicile, DomicileInput} from "LegalEntities/Domain/ValueObject/Domicile";
import {InvestingExperience, InvestingExperienceInput} from "LegalEntities/Domain/ValueObject/InvestingExperience";
import {SSN, SSNInput} from "LegalEntities/Domain/ValueObject/SSN";
import {PersonalStatement, PersonalStatementInput} from "LegalEntities/Domain/ValueObject/PersonalStatements";
import {LegalProfileCompleted} from "LegalEntities/Domain/Events/ProfileEvents";

export type CompleteProfileInput = {
    name?: PersonalNameInput,
    dateOfBirth?: DateOfBirthInput,
    address?: AddressInput,
    idScan?: { id: string, fileName: string }[],
    SSN?: { ssn: SSNInput },
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

    public async execute(input: CompleteProfileInput, profileId: string): Promise<string[]> {
        let profile = await this.profileRepository.findOrCreateProfile(profileId);
        const events = [];
        const errors = [];
        if (profile.isCompleted()) {
            errors.push("PROFILE_ALREADY_COMPLETED");

            return errors;
        }

        for (const step of Object.keys(input)) {
            try {
                // @ts-ignore
                const data = input[step];
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
                            errors.push('SSN_IS_NOT_UNIQUE');
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
                        console.error(`Unknown step: ${step}`);

                        errors.push(`UNKNOWN_STEP`);
                        break;
                }
            } catch (error: any) {
                errors.push(error.message);
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
                errors.push('Profile completion verification failed');
            }
        }

        await this.profileRepository.storeProfile(profile, events);

        return errors;
    }
}