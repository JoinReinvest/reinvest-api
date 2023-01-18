import {InvestmentAccounts} from "InvestmentAccounts/index";
import {makeExecutableSchema} from "@graphql-tools/schema";
import {EmailAddress} from "ApiGateway/Schema/Scalars/EmailAddress";
import {mergeTypeDefs} from "@graphql-tools/merge";

const schema = `
    #graphql

    scalar EmailAddress
    
    type Profile {
        "Profile Id"
        id: ID!
        "The name of user"
        email: EmailAddress
        "The Id of the Cognito User"
        userId: String
        avatarUrl: String
    }

    type Query {
        getProfile: Profile
    }

    type Mutation {
        completeProfileDetails(
            firstName: String
            lastName: String
            middleName: String
        ): Profile
    }
`;
/**
 *     type Query {
 *         getProfile: Profile
 *     }
 */
const resolvers = {
    ...EmailAddress.resolvers,
    Query: {

    },
    Mutation: {
        completeProfileDetails: async (parent, {
            firstName,
            middleName,
            lastName
        }, {userId, modules}) => {
            //context.lambdaEvent.requestContext.authorizer
            const module = modules.get(
                InvestmentAccounts.moduleName
            ) as InvestmentAccounts.Main;
            const resolvers = module.api();
            await resolvers.createProfile(userId);

            return await resolvers.getProfileByUser(userId);
        },
    }
}
const queries = {
    // @ts-ignore
    // getProfileByUserId: async (parent, {userId}, context) => {
    //     const module = context.modules.get(
    //         InvestmentAccounts.moduleName
    //     ) as InvestmentAccounts.Main;
    //     const resolvers = module.api();
    //
    //     return await resolvers.getProfileByUser(userId);
    // },
};

// const mutations = {
//     // @ts-ignore
//     completeProfileDetails: async (parent, {
//         firstName,
//         middleName,
//         lastName
//     }, {userId, modules}) => {
//         //context.lambdaEvent.requestContext.authorizer
//         const module = modules.get(
//             InvestmentAccounts.moduleName
//         ) as InvestmentAccounts.Main;
//         const resolvers = module.api();
//         await resolvers.createProfile(userId);
//
//         return await resolvers.getProfileByUser(userId);
//     },
// };

export const Profile = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
})
