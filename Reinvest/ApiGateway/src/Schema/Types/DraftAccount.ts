import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import { GraphQLError } from 'graphql';
import { CompanyDraftAccountType, DraftAccountType } from 'LegalEntities/Domain/DraftAccount/DraftAccount';
import { LegalEntities } from 'LegalEntities/index';

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
        """
        Remove draft account
        IMPORTANT: it removes all uploaded avatar and documents from s3 for this draft account
        """
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
        """
        IMPORTANT: it removes previously uploaded avatar from s3 for this draft account
        """
        avatar: AvatarFileLinkInput
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

    type CorporateDraftAccount {
        id: ID,
        state: DraftAccountState
        avatar: GetAvatarLink
        isCompleted: Boolean
        details: CompanyDraftAccountDetails
    }

    type TrustDraftAccount {
        id: ID,
        state: DraftAccountState
        avatar: GetAvatarLink
        isCompleted: Boolean
        details: CompanyDraftAccountDetails
    }

    input CompanyNameInput {
        name: String!
    }

    type CompanyName {
        name: String
    }

    input AnnualRevenueInput {
        range: String!
    }

    type AnnualRevenue {
        range: String
    }

    input NumberOfEmployeesInput {
        range: String!
    }

    type NumberOfEmployees {
        range: String
    }

    input IndustryInput {
        value: String!
    }

    type Industry {
        value: String
    }

    enum CorporateCompanyTypeEnum {
        PARTNERSHIP
        LLC
        CORPORATION
    }

    input CorporateCompanyTypeInput {
        type: CorporateCompanyTypeEnum!
    }

    type CorporateCompanyType {
        type: CorporateCompanyTypeEnum
    }

    enum TrustCompanyTypeEnum {
        REVOCABLE
        IRREVOCABLE
    }

    input TrustCompanyTypeInput {
        type: TrustCompanyTypeEnum!
    }

    type TrustCompanyType{
        type: TrustCompanyTypeEnum
    }

    enum CompanyTypeEnum {
        PARTNERSHIP
        LLC
        CORPORATION
        REVOCABLE
        IRREVOCABLE
    }

    type CompanyType {
        type: CompanyTypeEnum
    }

    input StakeholderInput {
        name: PersonName!
        dateOfBirth: DateOfBirthInput!
        ssn: SSNInput!
        address: AddressInput!
        domicile: SimplifiedDomicileInput!
        """
        IMPORTANT: it removes previously uploaded id scan documents from s3 if the previous document ids are not listed in the request
        """
        idScan: [DocumentFileLinkInput]!
    }

    type Stakeholder {
        id: ID
        label: String
        name: PersonNameType
        dateOfBirth: DateOfBirth
        ssn: String
        address: Address
        domicile: SimplifiedDomicile
        idScan: [DocumentFileLinkId]
    }

    type CompanyDraftAccountDetails {
        companyName: CompanyName
        address: Address
        ein: EIN
        annualRevenue: AnnualRevenue
        numberOfEmployees: NumberOfEmployees
        industry: Industry
        companyDocuments: [DocumentFileLinkId]
        stakeholders: [Stakeholder]
        companyType: CompanyType
    }

    input StakeholderIdInput {
        id: ID!
    }

    input CorporateDraftAccountInput {
        companyName: CompanyNameInput
        address: AddressInput
        ein: EINInput
        annualRevenue: AnnualRevenueInput
        numberOfEmployees: NumberOfEmployeesInput
        industry: IndustryInput
        companyDocuments: [DocumentFileLinkInput]
        """
        IMPORTANT: it removes these documents from s3
        """
        removeDocuments: [DocumentFileLinkInput]
        """
        IMPORTANT: it removes previously uploaded avatar from s3 for this draft account
        """
        avatar: AvatarFileLinkInput
        stakeholders: [StakeholderInput]
        """
        IMPORTANT: it removes previously uploaded id scan documents from s3 for this stakeholder
        """
        removeStakeholders: [StakeholderIdInput]
        companyType: CorporateCompanyTypeInput
    }

    input TrustDraftAccountInput {
        companyName: CompanyNameInput
        address: AddressInput
        ein: EINInput
        annualRevenue: AnnualRevenueInput
        numberOfEmployees: NumberOfEmployeesInput
        industry: IndustryInput
        companyDocuments: [DocumentFileLinkInput]
        """
        IMPORTANT: it removes these documents from s3
        """
        removeDocuments: [DocumentFileLinkInput]
        """
        IMPORTANT: it removes previously uploaded avatar from s3 for this draft account
        """
        avatar: AvatarFileLinkInput
        stakeholders: [StakeholderInput]
        """
        IMPORTANT: it removes previously uploaded id scan documents from s3 for this stakeholder
        """
        removeStakeholders: [StakeholderIdInput]
        companyType: TrustCompanyTypeInput
    }

    type Query {
        "Get draft corporate account details"
        getCorporateDraftAccount(accountId: ID): CorporateDraftAccount
        "Get draft trust account details"
        getTrustDraftAccount(accountId: ID): TrustDraftAccount
    }

    type Mutation {
        "Complete corporate draft account"
        completeCorporateDraftAccount(accountId: ID, input: CorporateDraftAccountInput): CorporateDraftAccount
        "Complete trust draft account"
        completeTrustDraftAccount(accountId: ID, input: TrustDraftAccountInput): TrustDraftAccount
    }
`;

export const DraftAccount = {
  typeDefs: [sharedSchema, individualSchema, corporateTrustSchema],
  resolvers: {
    Query: {
      listAccountDrafts: async (parent: any, input: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.listDrafts(profileId);
      },
      getIndividualDraftAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.readDraft(profileId, accountId, DraftAccountType.INDIVIDUAL);
      },
      getCorporateDraftAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.readDraft(profileId, accountId, DraftAccountType.CORPORATE);
      },
      getTrustDraftAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return api.readDraft(profileId, accountId, DraftAccountType.TRUST);
      },
    },
    Mutation: {
      createDraftAccount: async (parent: any, { type }: { type: DraftAccountType }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const { status, id, message } = await api.createDraftAccount(profileId, type);

        if (!status) {
          throw new GraphQLError(message as string);
        }

        return {
          id,
          type,
        };
      },
      removeDraftAccount: async (parent: any, { draftAccountId }: { draftAccountId: string }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

        return await api.removeDraft(profileId, draftAccountId);
      },
      completeIndividualDraftAccount: async (parent: any, { accountId, input }: { accountId: string; input: any }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const errors = await api.completeIndividualDraftAccount(profileId, accountId, input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return api.readDraft(profileId, accountId, DraftAccountType.INDIVIDUAL);
      },
      completeCorporateDraftAccount: async (parent: any, { accountId, input }: { accountId: string; input: any }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const errors = await api.completeCompanyDraftAccount(profileId, accountId, DraftAccountType.CORPORATE, input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return api.readDraft(profileId, accountId, DraftAccountType.CORPORATE);
      },
      completeTrustDraftAccount: async (parent: any, { accountId, input }: { accountId: string; input: any }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const errors = await api.completeCompanyDraftAccount(profileId, accountId, DraftAccountType.TRUST, input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return api.readDraft(profileId, accountId, DraftAccountType.TRUST);
      },
    },
  },
};
