import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {PersonalName, PersonalNameInput} from "LegalEntities/Domain/ValueObject/PersonalName";
import {DateOfBirth, DateOfBirthInput} from "LegalEntities/Domain/ValueObject/DateOfBirth";
import {Address, AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {Avatar, AvatarInput, IdentityDocument, IdScanInput} from "LegalEntities/Domain/ValueObject/Document";
import {Domicile, DomicileInput} from "LegalEntities/Domain/ValueObject/Domicile";
import {PersonalStatement, PersonalStatementInput} from "LegalEntities/Domain/ValueObject/PersonalStatements";

export type CompleteProfileInput = {
    name?: PersonalNameInput,
    dateOfBirth?: DateOfBirthInput,
    address?: AddressInput,
    idScan?: IdScanInput,
    avatar?: AvatarInput,
    domicile?: DomicileInput,
    statements?: [PersonalStatementInput]
}


export class ProfileController {
    public static getClassName = (): string => "ProfileController";
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
                        const name = PersonalName.create(data);
                        profile.completeName(name);
                        break;
                    case 'dateOfBirth':
                        profile.completeDateOfBirth(DateOfBirth.create(data));
                        break;
                    case 'address':
                        profile.completeAddress(Address.create(data));
                        break;
                    case 'idScan':
                        profile.completeIdentityDocument(IdentityDocument.create(data));
                        break;
                    case 'avatar':
                        profile.completeAvatarDocument(Avatar.create(data));
                        break;
                    case 'domicile':
                        profile.completeDomicile(Domicile.create(data));
                        break;
                    case 'statements':
                        for (const rawStatement of data) {
                            const statement = PersonalStatement.create(rawStatement);
                            profile.addStatement(statement);
                        }
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

        await this.profileRepository.storeProfile(profile);

        return errors;
    }
}