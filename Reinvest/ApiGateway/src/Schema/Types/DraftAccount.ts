import {SessionContext} from "ApiGateway/index";
import {LegalEntities} from "LegalEntities/index";

const sharedSchema = `
    #graphql
    input NetRange {
        from: DollarInput,
        to: DollarInput
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

    input Employer {
        nameOfEmployer: String,
        occupation: String,
        industry: String
    }
    
    input IndividualAccountInput {
        experience: Experience!,
        employmentStatus: EmploymentStatus!,
        employer: Employer,
        netWorth: NetRange,
        netIncome: NetRange
    }

    type IndividualDraftAccount {
        id: ID
    }

    type Query {
        getIndividualDraftAccount(accountId: ID): IndividualDraftAccount
    }

    type Mutation {
        completeIndividualAccount(accountId: ID): IndividualDraftAccount
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
        completeCorporateAccount(accountId: ID): CorporateDraftAccount
        completeTrustAccount(accountId: ID): TrustDraftAccount
    }
`;
const accountMockResponse = {
    id: 'c73ad8f6-4328-4151-9cc8-3694b71054f6',
    type: 'Individual',
    avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS65qIxj7XlHTYOUsTX40vLGa5EuhKPBfirgg&usqp=CAU',
    positionTotal: '$5,560'
}

export const DraftAccount = {
    typeDefs: [sharedSchema, individualSchema, corporateTrustSchema],
    resolvers: {
        Query: {
            listAccountDrafts: async (parent: any,input: any,{profileId, modules}: SessionContext) => ([{id: 'test', type: "INDIVIDUAL"}]),

            getIndividualDraftAccount: async (parent: any,input: any,{profileId, modules}: SessionContext) => ([{id: 'test'}]),
            getCorporateDraftAccount: async (parent: any,input: any,{profileId, modules}: SessionContext) => ([{id: 'test'}]),
            getTrustDraftAccount: async (parent: any,input: any,{profileId, modules}: SessionContext) => ([{id: 'test'}]),
        },
        Mutation: {
            createDraftAccount: async (parent: any, {type}: any,{profileId, modules}: SessionContext) => ({id: 'test', type}),
            removeDraftAccount: async (parent: any, input: any, {profileId, modules}: SessionContext) => true,
            completeIndividualAccount: async (parent: any, input: any, {profileId, modules}: SessionContext) => ([{id: 'test'}]),
            completeCorporateAccount: async (parent: any, input: any, {profileId, modules}: SessionContext) => ([{id: 'test'}]),
            completeTrustAccount: async (parent: any, input: any, {profileId, modules}: SessionContext) => ([{id: 'test'}]),
        }
    }
}
