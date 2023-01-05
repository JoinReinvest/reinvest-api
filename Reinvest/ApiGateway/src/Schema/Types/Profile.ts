import {InvestmentAccounts} from "InvestmentAccounts/index";

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
    getProfileByUserId: async (parent, {userId}, context) => {
        const module = context.modules.get(
            InvestmentAccounts.moduleName
        ) as InvestmentAccounts.Main;
        const resolvers = module.api();

        return await resolvers.getProfileByUser(userId);
    },
};

const mutations = {
    // @ts-ignore
    createProfile: async (parent, {userId}, context) => {
        //context.lambdaEvent.requestContext.authorizer
        const module = context.modules.get(
            InvestmentAccounts.moduleName
        ) as InvestmentAccounts.Main;
        const resolvers = module.api();
        await resolvers.createProfile(userId);

        return await resolvers.getProfileByUser(userId);
    },
};

export const Profile = {
    schema,
    queries,
    mutations,
};
