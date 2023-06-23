import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import dayjs from 'dayjs';
import { GraphQLError } from 'graphql';
import { Portfolio } from 'Portfolio/index';
import { Investments as InvestmentsModule } from 'Reinvest/Investments/src';
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
        tradeId: String!
        createdAt: ISODateTime!
        amount: USD!
        status: InvestmentStatus!
        investmentFees: USD
        subscriptionAgreementId: ID
        bankAccount: BankAccount
    }

    type InvestmentOverview {
        id: ID!
        tradeId: String!
        createdAt: ISODateTime!
        amount: USD!
    }

    type Query {
        """
        It returns the investment summary.
        Use this method to get info about the investment fees.
        """
        getInvestmentSummary(investmentId: ID!): InvestmentSummary!

        """
        It returns the subscription agreement.
        """
        getSubscriptionAgreement(subscriptionAgreementId: ID!): SubscriptionAgreement!
        """
        List of all investments history
        """
        listInvestments(accountId: ID!, pagination: Pagination = {page: 0, perPage: 10}): [InvestmentOverview]!
    }

    type Mutation {
        """
        It creates new investment and returns its ID.
        It requires bank account to be linked to the account.
        In other case it throws an error.
        """
        createInvestment(accountId: ID!, amount: USDInput): ID!

        """
        It creates new subscription agreement for the specific investment
        It returns the content of the agreement that must be rendered on the client side.
        Client must sign the agreement and call signSubscriptionAgreement mutation.
        """
        createSubscriptionAgreement(investmentId: ID!): SubscriptionAgreement!

        """
        It signs the subscription agreement.
        """
        signSubscriptionAgreement(investmentId: ID!): Boolean!

        """
        Approves the fees for the specific investment.
        In case if extra fee is required for recurring investment and the investment was started automatically by the system, then
        use this method to approve the fees (it will ask for that on verification step triggered from the notification).
        """
        approveFees(investmentId: ID!): Boolean!

        """
        It starts the investment.
        It requires subscription agreement to be signed and fees to be approved.
        The fees can be approved also by this method (if approveFees is true).
        """
        startInvestment(investmentId: ID!, approveFees: Boolean): Boolean!

        """
        It aborts the investment that haven't been started yet (by startInvestment mutation).
        """
        abortInvestment(investmentId: ID!): Boolean!

        """
        [MOCK] It cancels the investment that is in Funding or Funded state, but the Grace period has not been passed away yet
        """
        cancelInvestment(investmentId: ID!): Boolean!
    }
`;
export const subscriptionAgreementIdMock = 'e04ce44d-eb21-4691-99cc-89fd11c2bfef';
const investmentSummaryMock = (tradeId: string, days: number) => ({
  id: (days < 10 ? `0${days}` : days) + 'e94d4c-f237-4f10-aa05-be8ade282b' + (days < 10 ? `0${days}` : days),
  tradeId,
  createdAt: dayjs().subtract(days, 'day').format('YYYY-MM-DDThh:mm:ss'),
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
});

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
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);
        let investmentSummary = await investmentAccountsApi.investmentSummaryQuery(profileId, investmentId);

        if (!investmentSummary) {
          throw new GraphQLError('CANNOT_GET_SUMMARY_FOR_GIVEN_INVESTMENT');
        }

        if (investmentSummary.bankAccountId) {
          const api = modules.getApi<Registration.ApiType>(Registration);
          const bankAccount = await api.getBankAccount(profileId, investmentSummary.bankAccountId);

          if (bankAccount) {
            investmentSummary = {
              ...investmentSummary,
              // @ts-ignore
              bankAccount,
            };
          }
        }

        return investmentSummary;
      },
      getSubscriptionAgreement: async (parent: any, { subscriptionAgreementId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const subscriptionAgreement = await investmentAccountsApi.subscriptionAgreementQuery(profileId, subscriptionAgreementId);

        if (!subscriptionAgreement) {
          throw new GraphQLError('CANNOT_FIND_SUBSCRIPTION_AGREEMENT');
        }

        return subscriptionAgreement;
      },
      listInvestments: async (parent: any, { accountId, pagination }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const list = await investmentAccountsApi.listInvestments(profileId, accountId, pagination);

        return list;
      },
    },
    Mutation: {
      createInvestment: async (parent: any, { accountId, amount }: CreateInvestment, { profileId, modules, throwIfBanned }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);
        const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);
        const registrationApi = modules.getApi<Registration.ApiType>(Registration);
        const individualAccountId = await mapAccountIdToParentAccountIdIfRequired(profileId, accountId, modules);
        throwIfBanned(individualAccountId);
        throwIfBanned(accountId);

        const bankAccountData = await registrationApi.readBankAccount(profileId, individualAccountId);

        if (!bankAccountData?.bankAccountId) {
          throw new GraphQLError('CANNOT_FIND_BANK_ACCOUNT_ID');
        }

        const bankAccountId = bankAccountData.bankAccountId;
        const { portfolioId } = await portfolioApi.getActivePortfolio();

        const investmentId = await investmentAccountsApi.createInvestment(
          portfolioId,
          profileId,
          accountId,
          bankAccountId,
          amount,
          accountId === individualAccountId ? null : individualAccountId,
        );

        return investmentId;
      },
      startInvestment: async (parent: any, { investmentId, approveFees }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const isStartedInvestment = await investmentAccountsApi.startInvestment(profileId, investmentId, approveFees);

        if (!isStartedInvestment) {
          throw new GraphQLError('CANNOT_START_INVESTMENT');
        }

        return isStartedInvestment;
      },
      approveFees: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const isApproved = await investmentAccountsApi.approveFees(profileId, investmentId);

        return isApproved;
      },
      createSubscriptionAgreement: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const subscriptionAgreementId = await investmentAccountsApi.createSubscriptionAgreement(profileId, investmentId);

        if (!subscriptionAgreementId) {
          throw new JsonGraphQLError('COULDNT_CREATE_SUBSCRIPTION');
        }

        const subscriptionAgreement = await investmentAccountsApi.subscriptionAgreementQuery(profileId, subscriptionAgreementId);

        return subscriptionAgreement;
      },
      signSubscriptionAgreement: async (parent: any, { investmentId }: any, { profileId, modules, clientIp }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const isSigned = await investmentAccountsApi.signSubscriptionAgreement(profileId, investmentId, clientIp);

        if (!isSigned) {
          throw new JsonGraphQLError('CANNOT_SIGN_SUBSCRIPTION_AGREEMENT');
        }

        return isSigned;
      },
      abortInvestment: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const status = await investmentAccountsApi.abortInvestment(profileId, investmentId);

        return status;
      },
      cancelInvestment: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        return true;
      },
    },
  },
};
