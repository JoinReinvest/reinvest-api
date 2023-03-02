import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {DocumentsService} from "LegalEntities/Adapter/Modules/DocumentsService";
import {DomicileType} from "LegalEntities/Domain/ValueObject/Domicile";
import {AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {FileLink} from "Documents/Adapter/S3/FileLinkService";
import {
    PersonalStatement,
    PersonalStatementInput,
    PersonalStatementType
} from "LegalEntities/Domain/ValueObject/PersonalStatements";

export type ProfileResponse = {
    externalId: string,
    label: string
    avatar: FileLink | null,
    isCompleted: boolean,
    details: {
        firstName: string | undefined,
        middleName: string | undefined,
        lastName: string | undefined,
        dateOfBirth: string | null,
        domicile: {
            type: DomicileType | undefined,
            birthCountry: String | undefined,
            citizenshipCountry: String | undefined,
            visaType: String | undefined,
        },
        ssn: string | null,
        address: AddressInput | null,
        idScan: { id: string }[] | undefined,
        statements: {
            type: PersonalStatementType,
            details: string[]
        }[]
    }
}

export class GetProfileController {
    public static getClassName = (): string => "GetProfileController";
    private profileRepository: ProfileRepository;
    private documents: DocumentsService;

    constructor(profileRepository: ProfileRepository, documents: DocumentsService) {
        this.profileRepository = profileRepository;
        this.documents = documents;
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
            avatar: await this.documents.getLink(profileObject.avatar),
            isCompleted: profileObject.isCompleted,
            details: {
                firstName: profileObject.name?.firstName,
                middleName: profileObject.name?.middleName,
                lastName: profileObject.name?.lastName,
                dateOfBirth: profileObject.dateOfBirth,
                domicile: {
                    type: profileObject.domicile?.type,
                    birthCountry: profileObject.domicile?.forGreenCard?.birthCountry ?? profileObject.domicile?.forVisa?.birthCountry,
                    citizenshipCountry: profileObject.domicile?.forGreenCard?.citizenshipCountry ?? profileObject.domicile?.forVisa?.citizenshipCountry,
                    visaType: profileObject.domicile?.forVisa?.visaType
                },
                address: profileObject.address,
                ssn: profileObject.ssn,
                idScan: profileObject.idScan?.ids.map((id) => ({id})),
                statements: profile.getStatements().map((statement: PersonalStatement) => ({
                    type: statement.getType(),
                    details: statement.getDetails()
                }))
            }
        };
    }
}
