import {LegalEntities} from "LegalEntities/index";
import {SessionContext} from "ApiGateway/index";
import {PersonType} from "LegalEntities/Port/Api/PeopleController";
import LegalEntitiesApiType = LegalEntities.LegalEntitiesApiType;

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
        name: String
        avatarUrl: String
        accounts: [AccountOverview]
    }

    input ProfileDetailsInput {
        name: PersonName
        "Date of Birth in format MM/DD/YYYY"
        dateOfBirth: USDate
        "Is the investor US. Citizen or US. Resident"
        domicile: Domicile
        "A valid SSN number"
        ssn: String
        address: AddressInput
    }

    type Query {
        getProfile: Profile
    }

    type Mutation {
        completeProfileDetails(input: ProfileDetailsInput): Profile
    }
`;

type CompleteProfileDetailsInput = {
    input: {
        name?: {
            firstName: string
            middleName?: string
            lastName: string,
        },
        dateOfBirth?: Date,

    }
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
            ) => profileMockResponse
        },
        Mutation: {
            completeProfileDetails: async (parent: any,
                                           {input}: CompleteProfileDetailsInput,
                                           {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntitiesApiType>(LegalEntities);
                api.completePerson(input, profileId, PersonType.Individual);

                return profileMockResponse;
            },
        },
    }
}

