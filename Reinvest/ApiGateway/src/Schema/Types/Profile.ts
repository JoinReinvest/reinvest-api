import {LegalEntities} from "LegalEntities/index";
import {SessionContext} from "ApiGateway/index";
import {CompleteProfileInput} from "LegalEntities/Port/Api/ProfileController";
import {ApolloError} from "apollo-server-errors";

const schema = `
    #graphql
    type ProfileDetails {
        firstName: String
        middleName: String
        lastName: String
        dateOfBirth: String
        domicile: Domicile
        address: Address
        ssn: String
        idScan: [FileLink]
        avatar: FileLink
        statements: [Statement]
    }

    """
    An investor profile information.
    Returns data about investor details, accounts and notifications
    """
    type Profile {
        "The external, nice-looking profile ID"
        externalId: String
        "The name/label of the user"
        label: String
        avatarUrl: String
        isCompleted: Boolean
        details: ProfileDetails
    }

    input ProfileDetailsInput {
        "An investor name"
        name: PersonName
        "Date of Birth in format YYYY-MM-DD"
        dateOfBirth: ISODate
        "Is the investor US. Citizen or US. Resident with Green Card or Visa"
        domicile: DomicileInput
        "A valid SSN number"
        ssn: SSNInput
        "Permanent address of an investor"
        address: AddressInput
        """
        ID scan can be provided in more then one document, ie. 2 scans of both sides of the ID.
        Required "id" provided in the @FileLink type from the @createDocumentsFileLinks mutation
        """
        idScan: [FileLinkInput]
        "Previously uploaded avatar. Please provide the id returned in @createAvatarFileLink mutation"
        avatar: FileLinkInput
        "FINRA, Politician, Trading company stakeholder, accredited investor statements"
        statements: [StatementInput]
        "If an investor decided to remove one of the statements during onboarding"
        removeStatements: [StatementInput]
        "Send this field if you want to finish the onboarding. In case of success verification, onboarding will be considered as completed"
        verifyAndFinish: Boolean
    }

    type Query {
        """[MOCK]"""
        getProfile: Profile
        """[MOCK]"""
        canOpenAccount(accountType: AccountType): Boolean
    }

    type Mutation {
        """
        Profile onboarding mutation.
        Every field in the input can be requested separately.
        In case of any failure all changes in the request are not stored in the database.
        To finish onboarding send field 'verifyAndFinish'
        """
        completeProfileDetails(input: ProfileDetailsInput): Profile

        """[MOCK]"""
        openAccount(draftAccountId: String): Boolean
    }
`;

type CompleteProfileDetailsInput = {
    input: CompleteProfileInput
}

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

export const Profile = {
    typeDefs: schema,
    resolvers: {
        Query: {
            getProfile: async (parent: any,
                               input: undefined,
                               {profileId, modules}: SessionContext
            ) => profileMockResponse,
            canOpenAccount: async (parent: any,
                                   data: undefined,
                                   {profileId, modules}: SessionContext
            ) => true
        },
        Mutation: {
            completeProfileDetails: async (parent: any,
                                           data: CompleteProfileDetailsInput,
                                           {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const {input} = data;
                const errors = await api.completeProfile(input, profileId);
                if (errors.length > 0) {
                    throw new ApolloError(JSON.stringify(errors));
                }
                return profileMockResponse;
            },

            openAccount: async (parent: any,
                                {draftAccountId}: any,
                                {profileId, modules}: SessionContext
            ) => {
                return true;
            },
        },
    }
}

