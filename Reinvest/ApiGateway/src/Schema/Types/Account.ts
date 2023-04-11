import {SessionContext} from "ApiGateway/index";
import {LegalEntities} from "LegalEntities/index";

const schema = `
    #graphql
    type AccountOverview {
        id: String
        label:String
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
        label:String
        avatar: GetAvatarLink
        positionTotal: String
        details: IndividualAccountDetails
    }

    type CorporateAccountDetails {
        companyName: CompanyName
        address: Address
        ein: String
        annualRevenue: AnnualRevenue
        numberOfEmployees: NumberOfEmployees
        industry: Industry
        companyType: CompanyType
        companyDocuments: [DocumentFileLinkId]
        stakeholders: [Stakeholder]
    }

    type CorporateAccount {
        id: String
        label:String
        avatar: GetAvatarLink
        positionTotal: String
        details: CorporateAccountDetails
    }

    type TrustAccountDetails {
        companyName: CompanyName
        address: Address
        ein: String
        annualRevenue: AnnualRevenue
        numberOfEmployees: NumberOfEmployees
        industry: Industry
        companyType: CompanyType
        companyDocuments: [DocumentFileLinkId]
        stakeholders: [Stakeholder]
    }

    type TrustAccount {
        id: String
        label:String
        avatar: GetAvatarLink
        positionTotal: String
        details: TrustAccountDetails
    }

    type Query {
        """
        Return all accounts overview
        [PARTIAL_MOCK] Position total is still mocked!!
        """
        getAccountsOverview: [AccountOverview]
        """
        Returns individual account information
        [PARTIAL_MOCK] Position total is still mocked!!
        """
        getIndividualAccount: IndividualAccount
        """
        Returns corporate account information
        [PARTIAL_MOCK] Position total is still mocked!!
        """
        getCorporateAccount(accountId: String): CorporateAccount
        """
        Returns trust account information
        [PARTIAL_MOCK] Position total is still mocked!!
        """
        getTrustAccount(accountId: String): TrustAccount
    }
`;

export const Account = {
    typeDefs: schema,
    resolvers: {
        Query: {
            getIndividualAccount: async (parent: any, input: any, {
                profileId,
                modules
            }: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const account = await api.getIndividualAccount(profileId);
                return {
                    ...account,
                    positionTotal: '$5,560'
                }
            },
            getCorporateAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const account = await api.getCompanyAccount(profileId, accountId);
                return {
                    ...account,
                    positionTotal: '$5,560'
                }
            },
            getTrustAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const account = await api.getCompanyAccount(profileId, accountId);
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
