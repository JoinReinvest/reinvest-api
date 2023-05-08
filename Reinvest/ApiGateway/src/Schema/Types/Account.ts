import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import { GraphQLError } from 'graphql/index';
import { LegalEntities } from 'LegalEntities/index';
import { Registration } from 'Registration/index';

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
        companyType: CorporateCompanyTypeInput
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
        positionTotal: String
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

    type BankAccount {
        accountNumber: String
        accountType: String
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
        Returns beneficiary account information
        [PARTIAL_MOCK] Position total is still mocked!!
        """
        getBeneficiaryAccount(accountId: String): BeneficiaryAccount
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

        """
        Returns basic bank account information.
        """
        readBankAccount(accountId: String!): BankAccount
    }

    type Mutation {
        """
        Open REINVEST Account based on draft.
        Currently supported: Individual Account
        """
        openAccount(draftAccountId: String): Boolean

        """
        Open beneficiary account
        """
        openBeneficiaryAccount(individualAccountId: String!, input: CreateBeneficiaryInput!): BeneficiaryAccount

        """
        It creates new link to the investor bank account. It works only if the account does not have any bank account linked yet.
        Every time when the system create new link it cost $1.80 (on prod). Do not call it if it is not necessary.
        The bank account will not be activated until the investor fulfills the bank account.
        """
        createBankAccount(accountId: String!): BankAccountLink

        """
        It updates the link to the investor bank account. It works only if the account has bank account linked already.
        Every time when the system create new link it cost $1.80 (on prod). Do not call it if it is not necessary.
        The bank account will not be activated until the investor fulfills the bank account.
        """
        updateBankAccount(accountId: String!): BankAccountLink

        """
        Provide the response from Plaid here.
        The bank account will not be activated until the investor fulfills the bank account.
        """
        fulfillBankAccount(accountId: String!, input: FulfillBankAccountInput!): Boolean
    }
`;

export const Account = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getIndividualAccount: async (parent: any, input: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.getIndividualAccount(profileId);

        return {
          ...account,
          positionTotal: '$5,560',
        };
      },
      getBeneficiaryAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.readBeneficiaryAccount(profileId, accountId);

        return {
          ...account,
          positionTotal: '$1,150.25',
        };
      },
      getCorporateAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.getCompanyAccount(profileId, accountId);

        return {
          ...account,
          positionTotal: '$5,560',
        };
      },
      getTrustAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const account = await api.getCompanyAccount(profileId, accountId);

        return {
          ...account,
          positionTotal: '$5,560',
        };
      },
      getAccountsOverview: async (parent: any, input: { accountId: string }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const accountsOverviewResponses = await api.getAccountsOverview(profileId);

        return accountsOverviewResponses.map(account => {
          return {
            ...account,
            positionTotal: '$5,560',
          };
        });
      },
      readBankAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Registration.ApiType>(Registration);
        const bankAccount = await api.readBankAccount(profileId, accountId);

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
          positionTotal: '$1,150.25',
        };
      },

      createBankAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Registration.ApiType>(Registration);
        const response = await api.createBankAccount(profileId, accountId);

        if (!response.status) {
          throw new GraphQLError('Failed to create bank account');
        }

        return response;
      },

      fulfillBankAccount: async (parent: any, { accountId, input }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Registration.ApiType>(Registration);
        const response = await api.fulfillBankAccount(profileId, accountId, input);

        if (!response.status) {
          throw new GraphQLError('Failed to fulfill bank account');
        }

        return response.status;
      },

      updateBankAccount: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Registration.ApiType>(Registration);
        const response = await api.updateBankAccount(profileId, accountId);

        if (!response.status) {
          throw new GraphQLError('Failed to update bank account');
        }

        return response;
      },
    },
  },
};
