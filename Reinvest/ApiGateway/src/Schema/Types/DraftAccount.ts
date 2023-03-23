import {SessionContext} from "ApiGateway/index";
import {LegalEntities} from "LegalEntities/index";
import {GraphQLError} from "graphql";
import {DraftAccountType} from "LegalEntities/Domain/DraftAccount/DraftAccount";

const sharedSchema = `
    #graphql
    input NetRangeInput {
        range: String!
    }

    type NetRange {
        range: String
    }

    type DraftAccount {
        id: ID
        type: DraftAccountType
    }

    enum DraftAccountState {
        ACTIVE
        OPENED
        CANCELED
    }

    type Query {
        """
        List all existing draft accounts if you need come back to onboarding
        """
        listAccountDrafts: [DraftAccount]
    }

    type Mutation {
        """
        Create draft of an account to fulfill with data before open it.
        You can have only one draft account created of a specific type in the same time.
        """
        createDraftAccount(type: DraftAccountType): DraftAccount
        "Remove draft account"
        removeDraftAccount(draftAccountId: ID): Boolean
    }

`;
const individualSchema = `
    #graphql
    enum EmploymentStatus {
        EMPLOYED
        UNEMPLOYED
        RETIRED
        STUDENT
    }

    type EmploymentStatusType {
        status: EmploymentStatus
    }

    input EmploymentStatusInput {
        status: EmploymentStatus!
    }

    input EmployerInput {
        nameOfEmployer: String!,
        title: String!,
        industry: String!
    }

    type Employer {
        nameOfEmployer: String,
        title: String,
        industry: String
    }

    input IndividualAccountInput {
        employmentStatus: EmploymentStatusInput
        employer: EmployerInput
        netWorth: NetRangeInput
        netIncome: NetRangeInput
        avatar: FileLinkInput
        "Send this field if you want to finish the onboarding. In case of success verification, onboarding will be considered as completed"
        verifyAndFinish: Boolean
    }

    type IndividualDraftAccountDetails {
        employmentStatus: EmploymentStatusType
        employer: Employer
        netWorth: NetRange
        netIncome: NetRange
    }

    type IndividualDraftAccount {
        id: ID,
        state: DraftAccountState
        avatar: GetAvatarLink
        isCompleted: Boolean
        details: IndividualDraftAccountDetails
    }

    type Query {
        """
        Get details of individual draft account
        """
        getIndividualDraftAccount(accountId: ID): IndividualDraftAccount
    }

    type Mutation {
        "Complete individual draft account"
        completeIndividualDraftAccount(accountId: ID, input: IndividualAccountInput): IndividualDraftAccount
    }
`;
const corporateTrustSchema = `
    #graphql
    type Stakeholder {
        legalName: String
        dateOfBirth: ISODate
        ssn: String
        address: Address
        domicile: Domicile
        idScan: [FileLinkId]
        email: EmailAddress
    }

    "[MOCK]"
    type CorporateDraftAccount {
        id: ID
        name: String
        address: Address
        ein: String
        annualRevenue: String
        numberOfEmployees: String
        industry: String
        companyDocuments: [FileLinkId]
        avatar: GetAvatarLink
        stakeholders: [Stakeholder]
        companyType: CorporateCompanyType
    }
    "[MOCK]"
    type TrustDraftAccount {
        id: ID
        name: String
        address: Address
        ein: String
        annualRevenue: String
        numberOfEmployees: String
        industry: String
        companyDocuments: [FileLinkId]
        avatar: GetAvatarLink
        stakeholders: [Stakeholder]
        companyType: TrustCompanyType
    }

    input CompanyNameInput {
        name: String!
    }

    input AnnualRevenueInput {
        revenue: String!
    }

    input NumberOfEmployeesInput {
        numberOfEmployees: String!
    }

    input IndustryInput {
        industry: String!
    }

    enum CorporateCompanyType {
        PARTNERSHIP
        LLC
        CORPORATION
    }

    enum TrustCompanyType {
        REVOCABLE
        IRREVOCABLE
    }

    input CorporateCompanyTypeInput {
        type: CorporateCompanyType!
    }

    input TrustCompanyTypeInput {
        type: TrustCompanyType
    }

    input StakeholderInput {
        legalName: LegalNameInput!
        dateOfBirth: ISODate!
        ssn: SSNInput!
        address: AddressInput!
        domicile: DomicileInput!
        idScan: [FileLinkInput]!
        email: EmailInput
    }

    input CorporateDraftAccountInput {
        name: CompanyNameInput
        address: AddressInput
        ein: EINInput
        annualRevenue: AnnualRevenueInput
        numberOfEmployees: NumberOfEmployeesInput
        industry: IndustryInput
        companyDocuments: [FileLinkInput]
        removeDocuments: [FileLinkInput]
        avatar: FileLinkInput
        stakeholders: [StakeholderInput]
        removeStakeholders: [SSNInput]
        companyType: CorporateCompanyTypeInput
    }

    input TrustDraftAccountInput {
        name: CompanyNameInput
        address: AddressInput
        ein: EINInput
        annualRevenue: AnnualRevenueInput
        numberOfEmployees: NumberOfEmployeesInput
        industry: IndustryInput
        companyDocuments: [FileLinkInput]
        removeDocuments: [FileLinkInput]
        avatar: FileLinkInput
        stakeholders: [StakeholderInput]
        removeStakeholders: [SSNInput]
        companyType: TrustCompanyTypeInput
    }

    type Query {
        "[MOCK]"
        getCorporateDraftAccount(accountId: ID): CorporateDraftAccount
        "[MOCK]"
        getTrustDraftAccount(accountId: ID): TrustDraftAccount
    }

    type Mutation {
        "[MOCK] Complete corporate draft account"
        completeCorporateDraftAccount(accountId: ID, input: CorporateDraftAccountInput): CorporateDraftAccount
        "[MOCK] Complete trust draft account"
        completeTrustDraftAccount(accountId: ID, input: TrustDraftAccountInput): TrustDraftAccount
    }
`;


const individualAccountMockResponse = {
    id: 'c73ad8f6-4328-4151-9cc8-3694b71054f6',
    avatar: {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS65qIxj7XlHTYOUsTX40vLGa5EuhKPBfirgg&usqp=CAU",
        id: "d98ad8f6-4328-4151-9cc8-3694b7104444"
    },
    employmentStatus: "EMPLOYED",
    employer: {
        nameOfEmployer: "Housekeeper Limited",
        title: "The Doer of Everything",
        industry: "Housekeeping"
    },
    netWorth: {range: "$25000-$100000"},
    netIncome: {range: "<$15000"}
}

const corporateTrustMockResponse = (isTrust: boolean = false) => ({
    id: 'c73ad8f6-4328-4151-9cc8-3694b71054f6',
    name: isTrust ? "Trust company" : "Corporate company",
    address: {
        addressLine1: "Sausage line",
        addressLine2: "2a/1",
        city: "NYC",
        zip: "90210",
        country: "USA",
        state: "NY"
    },
    ein: "12-3456789",
    annualRevenue: "$100000-$5000000",
    numberOfEmployees: "<10",
    industry: "Housekeeping",
    companyDocuments: [{
        id: "d98ad8f6-4328-4151-9cc8-3694b7104444"
    }, {
        id: "d98ad8f6-4328-4151-9cc8-3694b7104444"
    }, {
        id: "d98ad8f6-4328-4151-9cc8-3694b710444s4"
    }],
    avatar: {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS65qIxj7XlHTYOUsTX40vLGa5EuhKPBfirgg&usqp=CAU",
        id: "d98ad8f6-4328-4151-9cc8-3694b7104444"
    },
    stakeholders: [{
        address: {
            addressLine1: "Sausage line",
            addressLine2: "2a/1",
            city: "NYC",
            zip: "90210",
            country: "USA",
            state: "NY"
        },
        legalName: "John Doe",
        dateOfBirth: "2000-01-01",
        ssn: "12-345-6789",
        domicile: {
            type: "GREEN_CARD",
            birthCountry: 'France',
            citizenshipCountry: 'UK'

        },
        idScan: [{
            id: "d98ad8f6-4328-4151-9cc8-3694b7104444"
        }],
        email: "john.doe@devkick.pl"
    }],
    companyType: isTrust ? "IRREVOCABLE" : "LLC"
});

type NetRange = {
    from: string,
    to: string
}

export const DraftAccount = {
    typeDefs: [sharedSchema, individualSchema, corporateTrustSchema],
    resolvers: {
        Query: {
            listAccountDrafts: async (parent: any, input: any, {profileId, modules}: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

                return api.listDrafts(profileId);
            },
            getIndividualDraftAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

                return api.readDraft(profileId, accountId, DraftAccountType.INDIVIDUAL);
            },
            getCorporateDraftAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => (corporateTrustMockResponse(false)),
            getTrustDraftAccount: async (parent: any, {accountId}: any, {
                profileId,
                modules
            }: SessionContext) => (corporateTrustMockResponse(true)),
        },
        Mutation: {
            createDraftAccount: async (parent: any, {type}: any, {profileId, modules}: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const {status, id, message} = await api.createDraftAccount(profileId, type);
                if (!status) {
                    throw new GraphQLError(message as string);
                }

                return {
                    id,
                    type
                }
            },
            removeDraftAccount: async (parent: any, {draftAccountId}: { draftAccountId: string }, {
                profileId,
                modules
            }: SessionContext) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                return await api.removeDraft(profileId, draftAccountId);
            },
            completeIndividualDraftAccount: async (
                parent: any,
                {accountId, input}: { accountId: string, input: any },
                {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
                const errors = await api.completeIndividualDraftAccount(profileId, accountId, input);

                if (errors.length > 0) {
                    throw new GraphQLError(JSON.stringify(errors));
                }

                return api.readDraft(profileId, accountId, DraftAccountType.INDIVIDUAL);
            },
            completeCorporateDraftAccount: async (parent: any, input: any, {
                profileId,
                modules
            }: SessionContext) => (corporateTrustMockResponse(false)),
            completeTrustDraftAccount: async (parent: any, input: any, {
                profileId,
                modules
            }: SessionContext) => (corporateTrustMockResponse(true)),
        }
    }
}
