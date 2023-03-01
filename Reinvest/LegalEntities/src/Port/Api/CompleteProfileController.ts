import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {PersonalName, PersonalNameInput} from "LegalEntities/Domain/ValueObject/PersonalName";
import {DateOfBirth, DateOfBirthInput} from "LegalEntities/Domain/ValueObject/DateOfBirth";
import {Address, AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {Avatar, IdentityDocument} from "LegalEntities/Domain/ValueObject/Document";
import {Domicile, DomicileInput} from "LegalEntities/Domain/ValueObject/Domicile";
import {PersonalStatement, PersonalStatementInput} from "LegalEntities/Domain/ValueObject/PersonalStatements";
import {SSN, SSNInput} from "LegalEntities/Domain/ValueObject/SSN";

export type CompleteProfileInput = {
    name?: PersonalNameInput,
    dateOfBirth?: DateOfBirthInput,
    address?: AddressInput,
    idScan?: { id: string }[],
    avatar?: { id: string },
    SSN?: { ssn: SSNInput },
    domicile?: DomicileInput,
    statements?: PersonalStatementInput[],
    removeStatements?: PersonalStatementInput[],
    verifyAndFinish: boolean
}


export class CompleteProfileController {
    public static getClassName = (): string => "CompleteProfileController";
    private profileRepository: ProfileRepository;

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    public async completeProfile(input: CompleteProfileInput, profileId: string): Promise<string[]> {
        console.log({input})
        let profile = await this.profileRepository.findOrCreateProfile(profileId);

        const errors = []
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
                        const ids = data.map((idObject: { id: string }) => idObject.id);
                        profile.setIdentityDocument(IdentityDocument.create({ids, path: profileId}));
                        break;
                    case 'avatar':
                        const {id} = data;
                        profile.setAvatarDocument(Avatar.create({id, path: profileId}));
                        break;
                    case 'domicile':
                        profile.setDomicile(Domicile.create(data));
                        break;
                    case 'ssn':
                        const {ssn: ssnValue} = data;
                        const ssn = SSN.create(ssnValue);
                        if (await this.profileRepository.isSSNUnique(ssn)) {
                            profile.setSSN(ssn);
                        } else {
                            errors.push('SSN_IS_NOT_UNIQUE');
                        }
                        break;
                    case 'statements':
                        for (const rawStatement of data) {
                            console.log(rawStatement);
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
            } else {
                errors.push('Profile completion verification failed');
            }
        }

        await this.profileRepository.storeProfile(profile);

        return errors;
    }
}