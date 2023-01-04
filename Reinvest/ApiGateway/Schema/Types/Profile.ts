import {InvestmentAccounts} from "Reinvest/InvestmentAccounts";

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
// @ts-ignore
    getProfileByUserId: (parent, {userId}, context) => {
        const module = context.modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Module;
        const resolvers = module.api();

        return resolvers.getProfileByUser(userId);
    },
}

const mutations = {
// @ts-ignore
    createProfile: (parent, {userId}, context) => {
        //context.lambdaEvent.requestContext.authorizer
        const module = context.modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Module;
        const resolvers = module.api();
        resolvers.createProfile(userId);

        return resolvers.getProfileByUser(userId);
    },

}

export const Profile = {
    schema,
    queries,
    mutations,
};