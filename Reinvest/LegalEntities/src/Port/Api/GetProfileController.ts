import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";
import {DomicileType} from "LegalEntities/Domain/ValueObject/Domicile";
import {AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {FileLink} from "Documents/Adapter/S3/FileLinkService";
import {
    PersonalStatement,
    PersonalStatementType
} from "LegalEntities/Domain/ValueObject/PersonalStatements";
import {DocumentSchema, IdScanInput} from "LegalEntities/Domain/ValueObject/Document";

export type ProfileResponse = {
    externalId: string,
    label: string
    isCompleted: boolean,
    details: {
        firstName?: string,
        middleName?: string,
        lastName?: string,
        dateOfBirth: string | null,
        experience: string | null,
        domicile: {
            type?: DomicileType,
            birthCountry?: String,
            citizenshipCountry?: String,
            visaType?: String,
        },
        ssn: string | null,
        address: AddressInput | null,
        idScan?: { id: string, fileName: string }[],
        statements: {
            type: PersonalStatementType,
            details: string[]
        }[]
    }
}

export type ProfileForSynchronization = {
    firstName?: string,
    middleName?: string,
    lastName?: string,
    dateOfBirth: string | null,
    experience: string | null,
    domicileType: DomicileType | null,
    ssn: string | null,
    address: AddressInput | null,
    idScan: IdScanInput,
}

export class GetProfileController {
    public static getClassName = (): string => "GetProfileController";
    private profileRepository: ProfileRepository;

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    public async getProfile(profileId: string): Promise<ProfileResponse> {
        const profile = await this.profileRepository.findProfile(profileId);
        if (profile === null) {
            return {} as ProfileResponse;
        }

        const profileObject = profile.toObject();
        return {
            externalId: profileObject.externalId,
            label: profileObject.label,
            isCompleted: profileObject.isCompleted,
            details: {
                firstName: profileObject.name?.firstName,
                middleName: profileObject.name?.middleName,
                lastName: profileObject.name?.lastName,
                experience: profileObject.investingExperience ? profileObject.investingExperience?.experience : null,
                dateOfBirth: profileObject.dateOfBirth,
                domicile: {
                    type: profileObject.domicile?.type,
                    birthCountry: profileObject.domicile?.forGreenCard?.birthCountry ?? profileObject.domicile?.forVisa?.birthCountry,
                    citizenshipCountry: profileObject.domicile?.forGreenCard?.citizenshipCountry ?? profileObject.domicile?.forVisa?.citizenshipCountry,
                    visaType: profileObject.domicile?.forVisa?.visaType
                },
                address: profileObject.address,
                ssn: profileObject.ssnObject !== null ? profileObject.ssnObject.anonymized : null,
                idScan: profileObject.idScan?.map((document: DocumentSchema) => ({
                    id: document.id,
                    fileName: document.fileName
                })),
                statements: profile.getStatements().map((statement: PersonalStatement) => ({
                    type: statement.getType(),
                    details: statement.getDetails()
                }))
            }
        };
    }

    public async getProfileForSynchronization(profileId: string): Promise<ProfileForSynchronization | null> {
        const profile = await this.profileRepository.findProfile(profileId);
        if (profile === null) {
            return null;
        }

        const profileObject = profile.toObject();
        return {
            firstName: profileObject.name?.firstName,
            middleName: profileObject.name?.middleName,
            lastName: profileObject.name?.lastName,
            experience: profileObject.investingExperience ? profileObject.investingExperience?.experience : null,
            dateOfBirth: profileObject.dateOfBirth,
            // @ts-ignore
            domicile: profileObject.domicile ? profileObject.domicile.type : null,
            address: profileObject.address,
            ssn: profile.exposeSSN(),
            idScan: profileObject.idScan ?? [],
        };
    }
}
