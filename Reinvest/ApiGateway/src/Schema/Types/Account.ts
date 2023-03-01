import {SessionContext} from "ApiGateway/index";
import {LegalEntities} from "LegalEntities/index";

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
        """
        [MOCK] Return account information - schema WIP!
        """
        getAccount(accountId: String): Account
        """
        [MOCK] Return all accounts overview
        """
        getAccountsOverview: [AccountOverview]
    }

`;

const accountMockResponse = {
    id: '1e22fea2-b9ac-42d4-be50-3ee25268ed64',
    type: 'Individual',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Letter_i_in_a_red_circle.svg/1200px-Letter_i_in_a_red_circle.svg.png',
    positionTotal: '$5,560'
}

export const Account = {
    typeDefs: schema,
    resolvers: {
        Query: {
            getAccount: async (parent: any,
                               input: { accountId: string },
                               {profileId, modules}: SessionContext
            ) => accountMockResponse,
            getAccountsOverview: async (parent: any,
                                        input: { accountId: string },
                                        {profileId, modules}: SessionContext
            ) => ([
                {
                    id: '1e22fea2-b9ac-42d4-be50-3ee25268ed64',
                    type: 'Individual',
                    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Letter_i_in_a_red_circle.svg/1200px-Letter_i_in_a_red_circle.svg.png',
                    positionTotal: '$5,560'
                },
                {
                    id: 'a1043296-08b9-4c4f-9cdb-d6b89bffcd81',
                    type: 'Corporate',
                    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Eo_circle_red_letter-c.svg/1024px-Eo_circle_red_letter-c.svg.png',
                    positionTotal: '$25,122.12'
                },
                {
                    id: '6488a971-2a4a-4404-80f5-09d9b1349137',
                    type: 'Trust',
                    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Eo_circle_red_letter-t.svg/480px-Eo_circle_red_letter-t.svg.png',
                    positionTotal: '$0'
                }
            ])
        },
    }
}
