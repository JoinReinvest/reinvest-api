import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import { Archiving } from 'Archiving/index';
import { GraphQLError } from 'graphql/index';
import { LegalEntities } from 'LegalEntities/index';
import { Money } from 'Money/Money';
import { Registration } from 'Registration/index';
import type { UpdateCompanyAccountInput } from 'Reinvest/LegalEntities/src/Service/UpdateCompany';
import type { UpdateIndividualAccountInput } from 'Reinvest/LegalEntities/src/UseCases/UpdateIndividualAccount';
import Modules from 'Reinvest/Modules';
import { SharesAndDividends } from 'SharesAndDividends/index';

const schema = `
    #graphql
    type AccountOverview {
        id: ID
        label:String
        type: AccountType
        avatar: GetAvatarLink
        isBanned: Boolean
    }

    type IndividualAccountDetails {
        employmentStatus: EmploymentStatusType
        employer: Employer
        netWorth: NetRange
        netIncome: NetRange
    }

    type IndividualAccount {
        id: ID
        label:String
        avatar: GetAvatarLink
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
        id: ID
        label:String
        avatar: GetAvatarLink
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
        id: ID
        label:String
        avatar: GetAvatarLink
        details: TrustAccountDetails
    }

    input UpdateStakeholderForVerificationInput {
        name: PersonName
        dateOfBirth: DateOfBirthInput
        address: AddressInput
        domicile: SimplifiedDomicileInput
        """IMPORTANT: it removes previously uploaded id scan documents from s3 if the previous document ids are not listed in the request"""
        idScan: [DocumentFileLinkInput]
    }

    input UpdateCompanyForVerificationInput {
        companyName: CompanyNameInput
        address: AddressInput
        companyDocuments: [DocumentFileLinkInput]
        """
        IMPORTANT: it removes these documents from s3
        """
        removeDocuments: [DocumentFileLinkInput]
        stakeholders: [StakeholderInput]
        """
        IMPORTANT: it removes previously uploaded id scan documents from s3 for this stakeholder
        """
        removeStakeholders: [StakeholderIdInput]
    }

    input BeneficiaryNameInput {
        firstName: String!
        lastName: String!
    }

    type BeneficiaryName{
        firstName: String!
        lastName: String!
    }

    input CreateBeneficiaryInput {
        name: BeneficiaryNameInput!
        avatar: AvatarFileLinkInput
    }

    type BeneficiaryDetails {
        name: BeneficiaryName
    }

    type BeneficiaryAccount {
        id: ID
        label: String
        avatar: GetAvatarLink
        details: BeneficiaryDetails
    }

    type BankAccountLink {
        link: String
    }

    """ Plaid response"""
    input FulfillBankAccountInput {
        """ plaidAccountDetails.refNum"""
        refNumber: String!
        """ plaidAccountDetails.account_number"""
        accountNumber: String!
        """ plaidAccountDetails.routing_number"""
        routingNumber: String!
        """ plaidAccountDetails.account_type"""
        accountType: String!
        """ plaidAccountDetails.institutionId"""
        institutionId: String
        """ plaidAccountDetails.institution_name"""
        institutionName: String
        """ plaidAccountDetails.account_name"""
        accountName: String
    }

    enum BankAccountStatus {
        ACTIVE
        INACTIVE
        DRAFT
    }

    type BankAccount {
        accountNumber: String
        accountType: String
        bankName: String
        bankAccountStatus: BankAccountStatus
    }

    input UpdateCompanyAccountInput {
        address: AddressInput
        annualRevenue: AnnualRevenueInput
        numberOfEmployees: NumberOfEmployeesInput
        industry: IndustryInput
        companyDocuments: [DocumentFileLinkInput]
        """
        IMPORTANT: it removes these documents from s3
        """
        removeDocuments: [DocumentFileLinkInput]
        """
        IMPORTANT: it removes previously uploaded avatar from s3 for this account
        """
        avatar: AvatarFileLinkInput
        stakeholders: [StakeholderInput]
        """
        IMPORTANT: it removes previously uploaded id scan documents from s3 for this stakeholder
        """
        removeStakeholders: [StakeholderIdInput]
    }

    input UpdateBeneficiaryAccountInput {
        name: BeneficiaryNameInput
        avatar: AvatarFileLinkInput
    }

    type ArchivedBeneficiaryStatus {
        archived: Boolean!
        parentAccountUpdatedValue: USD
    }

    type Query {
        """
        Return all accounts overview
        """
        getAccountsOverview: [AccountOverview]
        """
        Returns individual account information
        """
        getIndividualAccount: IndividualAccount
        """
        Returns beneficiary account information
        """
        getBeneficiaryAccount(accountId: ID!): BeneficiaryAccount
        """
        Returns corporate account information
        """
        getCorporateAccount(accountId: ID!): CorporateAccount
        """
        Returns trust account information
        """
        getTrustAccount(accountId: ID!): TrustAccount

        """
        Returns basic bank account information.
        """
        readBankAccount(accountId: ID!): BankAccount
    }

    type Mutation {
        """
        Open REINVEST Account based on draft.
        Currently supported: Individual Account
        """
        openAccount(draftAccountId: ID!): Boolean

        """
        Open beneficiary account
        """
        openBeneficiaryAccount(individualAccountId: ID!, input: CreateBeneficiaryInput!): BeneficiaryAccount

        """
        It creates new link to the investor bank account. It works only if the account does not have any bank account linked yet.
        Every time when the system create new link it cost $1.80 (on prod). Do not call it if it is not necessary.
        The bank account will not be activated until the investor fulfills the bank account.
        """
        createBankAccount(accountId: ID!): BankAccountLink

        """
        It updates the link to the investor bank account. It works only if the account has bank account linked already.
        Every time when the system create new link it cost $1.80 (on prod). Do not call it if it is not necessary.
        The bank account will not be activated until the investor fulfills the bank account.
        """
        updateBankAccount(accountId: ID!): BankAccountLink

        """
        Provide the response from Plaid here.
        The bank account will not be activated until the investor fulfills the bank account.
        """
        fulfillBankAccount(accountId: ID!, input: FulfillBankAccountInput!): Boolean

        "Update individual account"
        updateIndividualAccount(accountId: ID!, input: IndividualAccountInput): IndividualAccount

        "Update corporate account"
        updateCorporateAccount(accountId: ID!, input: UpdateCompanyAccountInput): CorporateAccount

        "Update trust account"
        updateTrustAccount(accountId: ID!, input: UpdateCompanyAccountInput): TrustAccount

        "Update beneficiary account"
        updateBeneficiaryAccount(accountId: ID!, input: UpdateBeneficiaryAccountInput): BeneficiaryAccount

        "[MOCK] Archive beneficiary account - it moves investments from a beneficiary to the individual account"
        archiveBeneficiaryAccount(accountId: ID!): ArchivedBeneficiaryStatus!
    }
`;

type UpdateIndividualAccountDetailsInput = {
  accountId: string;
  input: UpdateIndividualAccountInput;
};

type UpdateCorporateAccountDetailsInput = {
  accountId: string;
  input: UpdateCompanyAccountInput;
};

type UpdateTrustAccountDetailsInput = {
  accountId: string;
  input: UpdateCompanyAccountInput;
};

export async function mapAccountIdToParentAccountIdIfRequired(profileId: string, accountId: string, modules: Modules): Promise<string> {
  const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

  return api.mapAccountIdToParentAccountIdIfRequired(profileId, accountId);
}

export const Account = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getIndividualAccount: async (parent: any, input: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.getIndividualAccount(profileId);

        return {
          ...account,
        };
      },
      getBeneficiaryAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.readBeneficiaryAccount(profileId, accountId);

        return {
          ...account,
        };
      },
      getCorporateAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.getCompanyAccount(profileId, accountId);

        return {
          ...account,
        };
      },
      getTrustAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.getCompanyAccount(profileId, accountId);

        return {
          ...account,
        };
      },
      getAccountsOverview: async (parent: any, input: { accountId: string }, { profileId, modules, isBannedAccount }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const accountsOverviewResponses = await api.getAccountsOverview(profileId);

        return accountsOverviewResponses.map(account => {
          return {
            ...account,
            isBanned: isBannedAccount(account.id),
          };
        });
      },
      readBankAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const parentAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);
        const api = modules.getApi<Registration.ApiType>(Registration);
        const bankAccount = await api.readBankAccount(profileId, parentAccountId);

        if (!bankAccount) {
          throw new GraphQLError('Bank account not exists');
        }

        return bankAccount;
      },
    },
    Mutation: {
      openAccount: async (parent: any, { draftAccountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const error = await api.transformDraftAccountIntoRegularAccount(profileId, draftAccountId);

        if (error !== null) {
          throw new GraphQLError(error);
        }

        return true;
      },

      openBeneficiaryAccount: async (parent: any, { individualAccountId, input: beneficiaryData }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const response = await api.openBeneficiaryAccount(profileId, individualAccountId, beneficiaryData);

        if (!response.status || !response?.accountId) {
          throw new JsonGraphQLError(response.errors);
        }

        const account = await api.readBeneficiaryAccount(profileId, response.accountId);

        return {
          ...account,
        };
      },

      createBankAccount: async (parent: any, { accountId }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        const parentAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);
        throwIfBanned(parentAccountId);

        const api = modules.getApi<Registration.ApiType>(Registration);
        const response = await api.createBankAccount(profileId, parentAccountId);

        if (!response.status) {
          throw new GraphQLError('Failed to create bank account');
        }

        return response;
      },

      fulfillBankAccount: async (parent: any, { accountId, input }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        const parentAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);
        throwIfBanned(parentAccountId);

        const api = modules.getApi<Registration.ApiType>(Registration);
        const response = await api.fulfillBankAccount(profileId, parentAccountId, input);

        if (!response.status) {
          throw new GraphQLError('Failed to fulfill bank account');
        }

        return response.status;
      },

      updateBankAccount: async (parent: any, { accountId }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        const parentAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);
        throwIfBanned(parentAccountId);

        const api = modules.getApi<Registration.ApiType>(Registration);
        const response = await api.updateBankAccount(profileId, parentAccountId);

        if (!response.status) {
          throw new GraphQLError('Failed to update bank account');
        }

        return response;
      },

      updateIndividualAccount: async (parent: any, data: UpdateIndividualAccountDetailsInput, { profileId, modules, throwIfBanned }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const { input, accountId } = data;
        throwIfBanned(accountId);

        const errors = await api.updateIndividualAccount(profileId, accountId, input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        const registrationApi = modules.getApi<Registration.ApiType>(Registration);
        await registrationApi.resynchronizeIndividualAccount(profileId);

        return api.getIndividualAccount(profileId);
      },
      updateCorporateAccount: async (parent: any, data: UpdateCorporateAccountDetailsInput, { profileId, modules, throwIfBanned }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const { input, accountId } = data;
        throwIfBanned(accountId);

        const errors = await api.updateCorporateAccount(profileId, accountId, input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        const registrationApi = modules.getApi<Registration.ApiType>(Registration);
        await registrationApi.resynchronizeCompanyAccount(profileId, accountId);

        return api.getCompanyAccount(profileId, accountId);
      },
      updateTrustAccount: async (parent: any, data: UpdateTrustAccountDetailsInput, { profileId, modules, throwIfBanned }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const { input, accountId } = data;
        throwIfBanned(accountId);

        const errors = await api.updateTrustAccount(profileId, accountId, input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        const registrationApi = modules.getApi<Registration.ApiType>(Registration);
        await registrationApi.resynchronizeCompanyAccount(profileId, accountId);

        return api.getCompanyAccount(profileId, accountId);
      },
      updateBeneficiaryAccount: async (
        parent: any,
        {
          input,
          accountId,
        }: {
          accountId: string;
          input: any;
        },
        { profileId, modules, throwIfBanned }: SessionContext,
      ) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const parentAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);
        throwIfBanned(parentAccountId);

        const errors = await api.updateBeneficiaryAccount(profileId, accountId, input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return api.readBeneficiaryAccount(profileId, accountId);
      },
      archiveBeneficiaryAccount: async (
        parent: any,
        {
          accountId,
        }: {
          accountId: string;
          input: any;
        },
        { profileId, modules, throwIfBanned }: SessionContext,
      ) => {
        const api = modules.getApi<Archiving.ApiType>(Archiving);

        const parentAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);
        throwIfBanned(parentAccountId);

        const status = await api.initArchivingBeneficiary(profileId, accountId);

        if (!status) {
          return {
            archived: false,
          };
        }

        const sadApi = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const { accountValueAmount: parentAccountAmount } = await sadApi.getAccountStats(profileId, parentAccountId);
        const { accountValueAmount: beneficiaryAccountAmount } = await sadApi.getAccountStats(profileId, accountId);

        const accountValue = Money.lowPrecision(parentAccountAmount + beneficiaryAccountAmount);

        return {
          archived: true,
          parentAccountUpdatedValue: {
            value: accountValue.getAmount(),
            formatted: accountValue.getFormattedAmount(),
          },
        };
      },
    },
  },
};
