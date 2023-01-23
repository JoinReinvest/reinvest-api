import {InvestmentAccounts} from "InvestmentAccounts/index";
import {LegalEntities} from "LegalEntities/index";
import Modules from "Reinvest/Modules";
import LegalEntitiesApiType = LegalEntities.LegalEntitiesApiType;

const schema = `
    #graphql
    """
    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
    when an unknown printer took a galley of type and scrambled it to make a
    type specimen book. It has survived not only five centuries
    """
    type Profile {
        "Profile Id"
        id: ID!
        "The name of user"
        email: EmailAddress
        avatarUrl: String
    }

    input ProfileDetailsInput {
        firstName: String
        middleName: String
        lastName: String
    }

    type Query {
        getProfile: Profile
    }

    type Mutation {
        completeProfileDetails(input: ProfileDetailsInput): Profile
    }
`;

export const Profile = {
    typeDefs: schema,
    resolvers: {
        Query: {
            getProfile: (_, __, {profileId}) => ({
                id: profileId,
                email: 'lukasz@xyz.pl',
                avatarUrl: "http://some.com"
            })
        },
        Mutation: {
            completeProfileDetails: async (parent, {input: {firstName, lastName}}, {
                profileId,
                modules
            }: { modules: Modules }) => {
                const api = modules.getApi<LegalEntitiesApiType>(LegalEntities);
                api.completePerson(firstName, lastName);

                return {
                    id: profileId,
                    email: 'lukasz@xyz.pl',
                    avatarUrl: "http://some.com"
                }
            },
        }
    }
}
