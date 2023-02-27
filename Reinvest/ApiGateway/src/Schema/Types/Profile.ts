import {LegalEntities} from "LegalEntities/index";
import {SessionContext} from "ApiGateway/index";
import {CompleteProfileInput} from "LegalEntities/Port/Api/ProfileController";

const schema = `
    #graphql
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
        accounts: [AccountOverview]
        isCompleted: Boolean
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
    }

    type Query {
        getProfile: Profile
        canOpenAccount(accountType: AccountType): Boolean
    }

    type Mutation {
        """
        Profile onboarding mutation.
        Every field in the input can be requested separately.
        To verify if all required fields are provided see the @Profile.isCompleted field
        """
        completeProfileDetails(input: ProfileDetailsInput): Profile
        openAccount(draftAccountId: String): Boolean
    }
`;

type CompleteProfileDetailsInput = {
    input: CompleteProfileInput
}

const profileMockResponse = {
    externalId: "m478167880",
    name: "mBrandon Rule",
    avatarUrl: "https://thumbs.dreamstime.com/b/test-icon-vector-question-mark-female-user-person-profile-avatar-symbol-help-sign-glyph-pictogram-illustration-test-168789128.jpg",
    accounts: [
        {
            id: 'mc73ad8f6-4328-4151-9cc8-3694b71054f6',
            type: 'mIndividual',
            avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS65qIxj7XlHTYOUsTX40vLGa5EuhKPBfirgg&usqp=CAU',
            positionTotal: 'm$5,560'
        }
    ],
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
                await api.completeProfile(input, profileId);

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

