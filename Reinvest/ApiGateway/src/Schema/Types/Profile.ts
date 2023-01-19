import {InvestmentAccounts} from "InvestmentAccounts/index";

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

export const Profile ={
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
            completeProfileDetails: async (parent, {
                firstName,
                middleName,
                lastName
            }, {profileId, modules}) => {

                // delegate to LegalEntities modules
                return {
                    id: profileId,
                    email: 'lukasz@xyz.pl',
                    avatarUrl: "http://some.com"
                }


                //context.lambdaEvent.requestContext.authorizer
                // const module = modules.get(
                //     InvestmentAccounts.moduleName
                // ) as InvestmentAccounts.Main;
                // const resolvers = module.api();
                // await resolvers.createProfile(userId);
                //
                // return await resolvers.getProfileByUser(userId);
            },
        }
    }
}
