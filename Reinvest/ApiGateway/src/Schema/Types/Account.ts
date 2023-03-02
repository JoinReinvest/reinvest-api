import {SessionContext} from "ApiGateway/index";
import {LegalEntities} from "LegalEntities/index";

const schema = `
    #graphql
    type AccountOverview {
        id: String
        type: String
        avatar: GetAvatarLink
        positionTotal: String
    }

    type Account {
        id: String
        type: String
        avatar: GetAvatarLink
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
    avatar: {
        id: "f5f80086-d691-4d23-a89c-3864bd4bddcb",
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Letter_i_in_a_red_circle.svg/1200px-Letter_i_in_a_red_circle.svg.png'
    },
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
                    avatar: {
                        id: 'e29d779e-0cb4-4032-a331-16bce1c63b9f',
                        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Letter_i_in_a_red_circle.svg/1200px-Letter_i_in_a_red_circle.svg.png'
                    },
                    positionTotal: '$5,560'
                },
                {
                    id: 'a1043296-08b9-4c4f-9cdb-d6b89bffcd81',
                    type: 'Corporate',
                    avatar: {
                        id: 'ac527e07-86d8-4a6e-aac7-cf710e831908',
                        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Eo_circle_red_letter-c.svg/1024px-Eo_circle_red_letter-c.svg.png'
                    },
                    positionTotal: '$25,122.12'
                },
                {
                    id: '6488a971-2a4a-4404-80f5-09d9b1349137',
                    type: 'Trust',
                    avatar: {
                        id: '147f3d09-a691-4979-a944-5e9c25ce62dd',
                        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Eo_circle_red_letter-t.svg/480px-Eo_circle_red_letter-t.svg.png'
                    },
                    positionTotal: '$0'
                }
            ])
        },
    }
}
