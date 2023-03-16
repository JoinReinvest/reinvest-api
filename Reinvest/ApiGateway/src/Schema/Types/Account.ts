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

    type IndividualAccountDetails {
        employmentStatus: EmploymentStatusType
        employer: Employer
        netWorth: NetRange
        netIncome: NetRange
    }

    type IndividualAccount {
        id: String
        avatar: GetAvatarLink
        positionTotal: String
        details: IndividualAccountDetails
    }

    type Query {
        """
        Returns individual account information
        [PARTIAL_MOCK] Position total is still mocked!!
        """
        getIndividualAccount(accountId: String): IndividualAccount
        """
        Return all accounts overview
        [PARTIAL_MOCK] Position total is still mocked!!
        """
        getAccountsOverview: [AccountOverview]
    }
`;

export const Account = {
    typeDefs: schema,
    resolvers: {
        Query: {
            getIndividualAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const account = await api.getIndividualAccount(profileId, accountId);
                return {
                    ...account,
                    positionTotal: '$5,560'
                }
            },
            getAccountsOverview: async (parent: any,
                                        input: { accountId: string },
                                        {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const accountsOverviewResponses = await api.getAccountsOverview(profileId);
                return accountsOverviewResponses.map((account) => {
                    return {
                        ...account,
                        positionTotal: '$5,560'
                    }
                });
            },
        },
    }
}
