import { SessionContext } from 'ApiGateway/index';
import { GraphQLError } from 'graphql';
import { Investments } from 'Investments/index';
import { Portfolio } from 'Portfolio/index';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { Withdrawals } from 'Withdrawals/index';

const schema = `
    #graphql
    enum DividendState {
        PENDING
        REINVESTED
        PAID_OUT
        PAYING_OUT
    }

    type Dividend {
        id: ID!
        date: ISODateTime!
        amount: USD!
        status: DividendState!
    }

    type DividendOverview {
        id: ID!
        date: ISODateTime!
        amount: USD!
        status: DividendState!
    }

    type DividendsList {
        dividendsList: [DividendOverview]!
    }

    type FundsWithdrawalSimulation {
        canWithdraw: Boolean!
        eligibleForWithdrawal: USD!
        accountValue: USD!
        penaltiesFee: USD!
    }

    type FundsWithdrawalAgreement {
        id: ID!
        status: AgreementStatus!
        createdAt: ISODateTime!
        signedAt: ISODateTime
        content: [AgreementSection!]!
    }

    enum FundsWithdrawalRequestStatus {
        AWAITING_SIGNING_AGREEMENT
        DRAFT
        AWAITING_DECISION
        APPROVED
        REJECTED
    }

    type FundsWithdrawalRequest {
        status: FundsWithdrawalRequestStatus!
        eligibleForWithdrawal: USD!
        accountValue: USD!
        penaltiesFee: USD!
        decisionMessage: String
        investorWithdrawalReason: String
        createdDate: ISODateTime!
        decisionDate: ISODateTime
    }

    type Query {
        getDividend(dividendId: ID!): Dividend!

        """
        List all dividends
        """
        listDividends(accountId: ID!): DividendsList!

        """
        Simulate funds withdrawal. It returns the simulation of withdrawal without any changes in the system.
        """
        simulateFundsWithdrawal(accountId: ID!): FundsWithdrawalSimulation!

        """
        Get funds withdrawal request. It returns the current status of funds withdrawal request.
        """
        getFundsWithdrawalRequest(accountId: ID!): FundsWithdrawalRequest

        """
        Get funds withdrawal agreement
        """
        getFundsWithdrawalAgreement(accountId: ID!): FundsWithdrawalAgreement

    }
    type Mutation {
        """
        Reinvest dividend - you can reinvest many dividends in the same time. If one of them is not reinvestable, then all of them will be rejected.
        """
        reinvestDividend(accountId: ID!, dividendIds: [ID!]): Boolean!

        """
        Withdraw dividend - you can withdraw many dividends in the same time. If one of them is not withdrawable, then all of them will be rejected.
        """
        withdrawDividend(accountId: ID!, dividendIds: [ID!]): Boolean!

        """
        Create funds withdrawal request. It is just a DRAFT. You need to sign the agreement and then request the withdrawal.
        """
        createFundsWithdrawalRequest(accountId: ID!, investorWithdrawalReason: String): FundsWithdrawalRequest!

        """
        It creates the funds withdrawal agreement.
        """
        createFundsWithdrawalAgreement(accountId: ID!): FundsWithdrawalAgreement!

        """
        It signs the agreement of funds withdrawal.
        """
        signFundsWithdrawalAgreement(accountId: ID!): FundsWithdrawalAgreement!

        """
        It requests the funds withdrawal. The investor must sign the agreement first.
        """
        requestFundsWithdrawal(accountId: ID!): FundsWithdrawalRequest!

        """
        It aborts the funds withdrawal request if it is not yet approved or rejected
        """
        abortFundsWithdrawalRequest(accountId: ID!): Boolean!
    }
`;

export const WithdrawalsSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      simulateFundsWithdrawal: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);

        return api.simulateWithdrawals(profileId, accountId);
      },
      getFundsWithdrawalRequest: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);

        return api.getFundsWithdrawalRequest(profileId, accountId);
      },
      getDividend: async (parent: any, { dividendId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        const dividend = await api.getDividend(profileId, dividendId);

        if (!dividend) {
          throw new GraphQLError('Dividend not found');
        }

        return dividend;
      },
      listDividends: async (parent: any, { accountId }: { accountId: string }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const list = await api.getDividendsList(profileId, accountId);

        return list;
      },
      getFundsWithdrawalAgreement: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);

        return api.getFundsWithdrawalAgreement(profileId, accountId);
      },
    },
    Mutation: {
      reinvestDividend: async (parent: any, { accountId, dividendIds }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        throwIfBanned(accountId);

        const api = modules.getApi<Investments.ApiType>(Investments);
        const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);
        const { portfolioId } = await portfolioApi.getActivePortfolio();

        return api.reinvestDividends(profileId, accountId, portfolioId, dividendIds);
      },
      withdrawDividend: async (parent: any, { accountId, dividendIds }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        throwIfBanned(accountId);

        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);

        return api.withdrawDividends(profileId, accountId, dividendIds);
      },

      createFundsWithdrawalRequest: async (parent: any, { accountId }: { accountId: string }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);
        const error = await api.createWithdrawalFundsRequest(profileId, accountId);

        if (error) {
          throw new GraphQLError(error);
        }

        return api.getFundsWithdrawalRequest(profileId, accountId);
      },
      createFundsWithdrawalAgreement: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);
        const error = await api.createFundsWithdrawalAgreement(profileId, accountId);

        if (error) {
          throw new GraphQLError(error);
        }

        return api.getFundsWithdrawalAgreement(profileId, accountId);
      },
      signFundsWithdrawalAgreement: async (parent: any, { accountId }: any, { profileId, modules, clientIp }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);

        const error = await api.signFundsWithdrawalAgreement(profileId, accountId, clientIp);

        if (error) {
          throw new GraphQLError(error);
        }

        return api.getFundsWithdrawalAgreement(profileId, accountId);
      },
      requestFundsWithdrawal: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);
        await api.requestFundWithdrawal(profileId, accountId);

        return api.getFundsWithdrawalRequest(profileId, accountId);
      },
      abortFundsWithdrawalRequest: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);

        const status = api.abortFundsWithdrawalRequest(profileId, accountId);

        return status;
      },
    },
  },
};
