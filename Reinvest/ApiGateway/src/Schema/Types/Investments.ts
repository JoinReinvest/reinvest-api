import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import { GraphQLError } from 'graphql';
import { Investments as InvestmentsApi } from 'Reinvest/Investments/src';
import { subscriptionAgreements } from 'Reinvest/Investments/src/Domain/SubscriptionAgreement';
import { LegalEntities } from 'Reinvest/LegalEntities/src';
import type Modules from 'Reinvest/Modules';
import { Registration } from 'Reinvest/Registration/src';

const schema = `
    #graphql
    enum InvestmentStatus {
        WAITING_FOR_SUBSCRIPTION_AGREEMENT
        WAITING_FOR_FEES_APPROVAL
        WAITING_FOR_INVESTMENT_START
        IN_PROGRESS
        FUNDED
        FAILED
        FINISHED
    }

    type InvestmentSummary {
        id: ID!
        tradeId: ID!
        createdAt: ISODateTime!
        amount: USD!
        status: InvestmentStatus!
        investmentFees: USD
        subscriptionAgreementId: ID
    }

    type Query {
        """
        [MOCK] It returns the investment summary.
        Use this method to get info about the investment fees.
        """
        getInvestmentSummary(investmentId: ID!): InvestmentSummary!

        """
        [MOCK] It returns the subscription agreement.
        """
        getSubscriptionAgreement(subscriptionAgreementId: ID!): SubscriptionAgreement!
    }

    type Mutation {
        """
        [MOCK] It creates new investment and returns its ID.
        It requires bank account to be linked to the account.
        In other case it throws an error.
        """
        createInvestment(accountId: ID!, amount: USDInput): ID!

        """
        [MOCK] It creates new subscription agreement for the specific investment
        It returns the content of the agreement that must be rendered on the client side.
        Client must sign the agreement and call signSubscriptionAgreement mutation.
        """
        createSubscriptionAgreement(investmentId: ID!): SubscriptionAgreement!

        """
        [MOCK] It signs the subscription agreement.
        """
        signSubscriptionAgreement(investmentId: ID!): Boolean!

        """
        [MOCK] Approves the fees for the specific investment.
        In case if extra fee is required for recurring investment and the investment was started automatically by the system, then
        use this method to approve the fees (it will ask for that on verification step triggered from the notification).
        """
        approveFees(investmentId: ID!): Boolean!

        """
        [MOCK] It starts the investment.
        It requires subscription agreement to be signed and fees to be approved.
        The fees can be approved also by this method (if approveFees is true).
        """
        startInvestment(investmentId: ID!, approveFees: Boolean): Boolean!

        """
        [MOCK] It aborts the investment that haven't been started yet (by startInvestment mutation).
        """
        abortInvestment(investmentId: ID!): Boolean!
    }
`;
const investmentIdMock = '73e94d4c-f237-4f10-aa05-be8ade282be1';
export const subscriptionAgreementIdMock = 'e04ce44d-eb21-4691-99cc-89fd11c2bfef';
const investmentSummaryMock = {
  id: investmentIdMock,
  tradeId: '47584',
  createdAt: '2023-03-24T12:32:16',
  amount: {
    value: '1000.00',
    formatted: '$1,000.00',
  },
  status: 'IN_PROGRESS',
  investmentFees: {
    value: '10.00',
    formatted: '$10.00',
  },
  subscriptionAgreementId: subscriptionAgreementIdMock,
};

export type USDInput = {
  value: number;
};

export type CreateInvestment = {
  accountId: string;
  amount: USDInput;
};

export async function mapAccountIdToParentAccountIdIfRequired(profileId: string, accountId: string, modules: Modules): Promise<string> {
  const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

  return api.mapAccountIdToParentAccountIdIfRequired(profileId, accountId);
}

export const Investments = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getInvestmentSummary: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsApi.ApiType>(InvestmentsApi);
        const investmentSummary = investmentAccountsApi.investmentSummaryQuery(profileId, investmentId);

        if (!investmentSummary) {
          throw new GraphQLError('CANNOT_GET_SUMMARY_FOR_GIVEN_INVESTMENT');
        }

        return investmentSummary;
      },
      getSubscriptionAgreement: async (parent: any, { subscriptionAgreementId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsApi.ApiType>(InvestmentsApi);

        const subscriptionAgreement = await investmentAccountsApi.subscriptionAgreementQuery(profileId, subscriptionAgreementId);

        if (!subscriptionAgreement) {
          throw new GraphQLError('CANNOT_FIND_SUBSCRIPTION_AGREEMENT');
        }

        return subscriptionAgreement;
      },
    },
    Mutation: {
      createInvestment: async (parent: any, { accountId, amount }: CreateInvestment, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsApi.ApiType>(InvestmentsApi);
        const registrationApi = modules.getApi<Registration.ApiType>(Registration);
        const individualAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);

        const bankAccountData = await registrationApi.readBankAccount(profileId, individualAccountId);

        if (!bankAccountData?.bankAccountId) {
          throw new GraphQLError('CANNOT_FIND_BANK_ACCOUNT_ID');
        }

        const bankAccountId = bankAccountData.bankAccountId;

        const investmentId = await investmentAccountsApi.createInvestment(profileId, individualAccountId, bankAccountId, amount);

        return investmentId;
      },
      startInvestment: async (parent: any, { investmentId, approveFees }: any, { profileId, modules }: SessionContext) => {
        if (!approveFees) {
          throw new GraphQLError('FEES_NOT_APPROVED');
        }

        return true;
      },
      approveFees: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        return true;
      },
      createSubscriptionAgreement: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsApi.ApiType>(InvestmentsApi);

        const subscriptionAgreementId = await investmentAccountsApi.createSubscriptionAgreement(profileId, investmentId);

        if (!subscriptionAgreementId) {
          throw new JsonGraphQLError('COULDNT_CREATE_SUBSCRIPTION');
        }

        const subscriptionAgreement = await investmentAccountsApi.subscriptionAgreementQuery(profileId, subscriptionAgreementId);

        return subscriptionAgreement;
      },
      signSubscriptionAgreement: async (parent: any, { investmentId }: any, { profileId, modules, clientIp }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsApi.ApiType>(InvestmentsApi);

        const subscriptionAgreementId = await investmentAccountsApi.signSubscriptionAgreement(profileId, investmentId, clientIp);

        if (!subscriptionAgreementId) {
          throw new JsonGraphQLError('CANNOT_FIND_INVESTMENT_RELATED_TO_SUBSCRIPTION_AGREEMENT');
        }

        const isAssigned = investmentAccountsApi.assignSubscriptionAgreementToInvestment(investmentId, subscriptionAgreementId);

        return isAssigned;
      },
      abortInvestment: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        return true;
      },
    },
  },
};
