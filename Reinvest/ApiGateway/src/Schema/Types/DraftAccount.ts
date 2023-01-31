import {SessionContext} from "ApiGateway/index";
import {LegalEntities} from "LegalEntities/index";

const sharedSchema = `
    #graphql
    input NetRangeInput {
        from: String!,
        to: String!
    }

    type NetRange {
        from: String
        to: String
    }

    type DraftAccount {
        id: ID
        type: AccountType
    }

    type Query {
        listAccountDrafts: [DraftAccount]
    }

    type Mutation {
        createDraftAccount(type: AccountType): DraftAccount
        removeDraftAccount(id: ID): Boolean
    }

`;
const individualSchema = `
    #graphql
    enum Experience {
        NO_EXPERIENCE
        SOME_EXPERIENCE
        VERY_EXPERIENCED
        EXPERT
    }

    enum EmploymentStatus {
        EMPLOYED
        UNEMPLOYED
        RETIRED
        STUDENT
    }

    input EmployerInput {
        nameOfEmployer: String,
        occupation: String,
        industry: String
    }

    type Employer {
        nameOfEmployer: String,
        occupation: String,
        industry: String
    }


    input IndividualAccountInput {
        experience: Experience,
        employmentStatus: EmploymentStatus,
        employer: EmployerInput,
        netWorth: NetRangeInput,
        netIncome: NetRangeInput
    }

    type IndividualDraftAccount {
        id: ID,
        experience: Experience
        employmentStatus: EmploymentStatus
        employer: Employer
        netWorth: NetRange
        netIncome: NetRange
    }

    type Query {
        getIndividualDraftAccount(accountId: ID): IndividualDraftAccount
    }

    type Mutation {
        completeIndividualDraftAccount(accountId: ID, input: IndividualAccountInput): IndividualDraftAccount
    }
`;
const corporateTrustSchema = `
    #graphql
    type CorporateDraftAccount {
        id: ID
    }
    type TrustDraftAccount {
        id: ID
    }

    type Query {
        getCorporateDraftAccount(accountId: ID): CorporateDraftAccount
        getTrustDraftAccount(accountId: ID): TrustDraftAccount
    }

    type Mutation {
        completeCorporateDraftAccount(accountId: ID): CorporateDraftAccount
        completeTrustDraftAccount(accountId: ID): TrustDraftAccount
    }
`;
const accountMockResponse = {
    id: 'c73ad8f6-4328-4151-9cc8-3694b71054f6',
    type: 'Individual',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS65qIxj7XlHTYOUsTX40vLGa5EuhKPBfirgg&usqp=CAU',
    positionTotal: '$5,560'
}

type NetRange = {
    from: string,
    to: string
}

type IndividualDraftAccountInput = {
    experience?: "NO_EXPERIENCE" | "SOME_EXPERIENCE" | "VERY_EXPERIENCED" | "EXPERT",
    employmentStatus?: "EMPLOYED" | "UNEMPLOYED" | "RETIRED" | "STUDENT",
    employer?: {
        nameOfEmployer: string,
        occupation: string,
        industry: string
    },
    netWorth?: NetRange,
    netIncome?: NetRange
};

export const DraftAccount = {
    typeDefs: [sharedSchema, individualSchema, corporateTrustSchema],
    resolvers: {
        Query: {
            listAccountDrafts: async (parent: any, input: any, {profileId, modules}: SessionContext) => ([{
                id: 'test',
                type: "INDIVIDUAL"
            }]),
            getIndividualDraftAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => ({id: accountId}),
            getCorporateDraftAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => ({id: accountId}),
            getTrustDraftAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => ({id: accountId}),
        },
        Mutation: {
            createDraftAccount: async (parent: any, {type}: any, {profileId, modules}: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                return api.createDraftAccount(profileId, type);
            },
            removeDraftAccount: async (parent: any, input: any, {profileId, modules}: SessionContext) => true,
            completeIndividualDraftAccount: async (
                parent: any,
                {accountId, input}: { accountId: string, input: IndividualDraftAccountInput },
                {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                return api.completeIndividualDraftAccount(profileId, accountId, input);
            },
            completeCorporateDraftAccount: async (parent: any, input: any, {
                profileId,
                modules
            }: SessionContext) => ([{id: 'test'}]),
            completeTrustDraftAccount: async (parent: any, input: any, {
                profileId,
                modules
            }: SessionContext) => ([{id: 'test'}]),
        }
    }
}
