import {SessionContext} from "ApiGateway/index";

const schema = `
    #graphql
    type AccountOverview {
        id: String
        type: String
        avatarUrl: String
        positionTotal: String
    }

    type Account {
        id: String
        type: String
        avatarUrl: String
        positionTotal: String
    }

    type Query {
        getAccount(accountId: String): Account
    }
`;

const accountMockResponse = {
    id: 'c73ad8f6-4328-4151-9cc8-3694b71054f6',
    type: 'Individual',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS65qIxj7XlHTYOUsTX40vLGa5EuhKPBfirgg&usqp=CAU',
    positionTotal: '$5,560'
}

export const Account = {
    typeDefs: schema,
    resolvers: {
        Query: {
            getAccount: async (parent: any,
                               input: { accountId: string },
                               {profileId, modules}: SessionContext
            ) => {
                // const api = modules.getApi<InvestmentAccountsApi>(InvestmentAccounts);
                return accountMockResponse;
            }
        },
    }
}
