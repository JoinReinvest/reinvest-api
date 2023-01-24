import {SessionContext} from "ApiGateway/index";

const schema = `
    #graphql
    type ProfileCompletionStatus {
        detailsCompleted: Boolean # ask Legal Entities
        phoneCompleted: Boolean # ask Identity
    }

    type Query {
        profileCompletionStatus: ProfileCompletionStatus
    }

`;

export const ProfileCompletionStatus = {
    typeDefs: schema,
    resolvers: {
        Query: {
            profileCompletionStatus: () => ({})
        },
        ProfileCompletionStatus: {
            detailsCompleted: async (parent: any,
                                     input: undefined,
                                     {profileId, modules}: SessionContext
            ) => {
                console.log({parent, input, profileId, modules});
                return false;
            },
            phoneCompleted: async (parent: any,
                                   input: undefined,
                                   {profileId, modules}: SessionContext
            ) => true
        },
    },
}

