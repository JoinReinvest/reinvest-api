import {InvestmentAccounts} from "Reinvest/InvestmentAccounts/bootstrap";

const schema = `
    #graphql
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
        getProfileByUserId(userId: String): Profile
    }

    type Mutation {
        createProfile(userId: String): Profile
    }
`;

const queries = {
    getProfileByUserId: (parent, {userId}, context) => {
        const module = context.modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Module;
        const resolvers = module.api();

        return resolvers.getProfileByUserResolver(userId);
    },
}

const mutations = {
    createProfile: (parent, {userId}, context) => {
        const module = context.modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Module;
        const resolvers = module.api();
        resolvers.createProfileResolver(userId);

        return resolvers.getProfileByUserResolver(userId);
    },

}

export const Profile = {
    schema,
    queries,
    mutations,
};

//
// const resolvers = {
//     Query: {
//         hello: (parent, args, contextValue, info) => {
//             console.log(contextValue.lambdaEvent.requestContext.authorizer);
//
//             return 'this is test';
//         }
//     },
//     Mutation: {
//         login: (parent, args, context) => {
//             console.log({parent, args, context});
//             return {
//                 ID: 'uuid',
//                 name: args.email,
//                 surname: 'kowalski',
//                 address: 'Factory street'
//             }
//         },
//     },
// };