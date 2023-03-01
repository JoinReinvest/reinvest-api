import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";

const profileMockResponse = {
    externalId: "478167880",
    label: "John Doe",
    avatarUrl: "https://thumbs.dreamstime.com/b/test-icon-vector-question-mark-female-user-person-profile-avatar-symbol-help-sign-glyph-pictogram-illustration-test-168789128.jpg",
    isCompleted: true,
    details: {
        firstName: "John",
        middleName: "",
        lastName: "Doe",
        dateOfBirth: "2000-01-01",
        domicile: {
            type: "CITIZEN"
        },
        address: {
            addressLine1: "River Street",
            addressLine2: "170/10",
            city: "New York",
            zip: "90210",
            country: "USA",
            state: "New York"
        },
        ssn: "12-XXX-XXX9",
        idScan: [{
            id: "f94cc755-b524-4c7b-8a91-866c2e35e84b",
            url: "https://thumbs.dreamstime.com/b/test-icon-vector-question-mark-female-user-person-profile-avatar-symbol-help-sign-glyph-pictogram-illustration-test-168789128.jpg"
        }],
        avatar: {
            id: "f94cc755-b524-4c7b-8a91-866c2e35e84b",
            url: "https://thumbs.dreamstime.com/b/test-icon-vector-question-mark-female-user-person-profile-avatar-symbol-help-sign-glyph-pictogram-illustration-test-168789128.jpg"
        },
        statements: [
            {
                type: "AccreditedInvestor",
                details: ["I_AM_AN_ACCREDITED_INVESTOR"]
            },
            {
                type: "FINRAMember",
                details: ["FinraCompanyName Ltd."]
            }
        ]
    }
};

export class GetProfileController {
    public static getClassName = (): string => "GetProfileController";
    private profileRepository: ProfileRepository;

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
    }

    public async getProfile(profileId: string): Promise<any> {
        return profileMockResponse; // todo return real profile information here
    }
}

