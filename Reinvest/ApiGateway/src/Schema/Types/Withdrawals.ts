import { SessionContext } from 'ApiGateway/index';
import { notificationsMock } from 'ApiGateway/Schema/Types/Notification';
import dayjs from 'dayjs';
import { GraphQLError } from 'graphql';
import { Investments } from 'Investments/index';
import { Portfolio } from 'Portfolio/index';
import { SharesAndDividends } from 'SharesAndDividends/index';

const schema = `
    #graphql
    enum DividendState {
        PENDING
        REINVESTED
        PAID_OUT
        WITHDRAWING
    }

    type Dividend {
        id: ID!
        date: ISODateTime!
        amount: USD!
        status: DividendState!
    }

    type GracePeriodInvestment {
        investmentId: String!
        amount: USD!
        gracePeriodEnd: ISODate!
    }

    type FundsWithdrawalSimulation {
        gracePeriodInvestments: [GracePeriodInvestment]!
        canWithdraw: Boolean!
        eligibleForWithdrawal: USD!
        accountValue: USD!
        penaltiesFee: USD!
    }

    enum FundsWithdrawalRequestStatus {
        AWAITING_SIGNING_AGREEMENT
        AWAITING_DECISION
        APPROVED
        REJECTED
    }

    type FundsWithdrawalRequest {
        status: FundsWithdrawalRequestStatus!
        eligibleForWithdrawal: USD!
        accountValue: USD!
        penaltiesFee: USD!
        rejectionMessage: String
        date: ISODateTime!
    }

    type Query {
        """
        [MOCK] Simulate funds withdrawal. It returns the simulation of withdrawal without any changes in the system.
        """
        simulateFundsWithdrawal(accountId: String!): FundsWithdrawalSimulation!

        """
        [MOCK] Get funds withdrawal request. It returns the current status of funds withdrawal request.
        """
        getFundsWithdrawalRequest(accountId: String!): FundsWithdrawalRequest

        getDividend(dividendId: String!): Dividend!
    }
    type Mutation {
        """
        Reinvest dividend - you can reinvest many dividends in the same time. If one of them is not reinvestable, then all of them will be rejected.
        """
        reinvestDividend(accountId: String!, dividendIds: [String!]): Boolean!

        """
        [MOCK] Withdraw dividend - you can withdraw many dividends in the same time. If one of them is not withdrawable, then all of them will be rejected.
        """
        withdrawDividend(accountId: String!, dividendIds: [String!]): Boolean!

        """
        [MOCK] Create funds withdrawal request. It is just a DRAFT. You need to sign the agreement and then request the withdrawal.
        """
        createFundsWithdrawalRequest(accountId: String!): FundsWithdrawalRequest!

        """
        [MOCK] It prepares the agreement for funds withdrawal file.
        The investor must download it, print it, sign it and upload it again.
        """
        createFundsWithdrawalAgreement(accountId: String!): GetDocumentLink!

        """
        [MOCK] It requests the funds withdrawal. The investor must sign the agreement first. To do that, use createFundsWithdrawalAgreement mutation and ask user to download, print, sign, scan and upload the agreement again.
        """
        requestFundsWithdrawal(accountId: String!, signedWithdrawalAgreementId: DocumentFileLinkInput): FundsWithdrawalRequest!

        """
        [MOCK] It aborts the funds withdrawal request if it is not yet approved or rejected
        """
        abortFundsWithdrawalRequest(accountId: String!): Boolean!
    }

`;

const fundsWithdrawalSimulationMock = {
  gracePeriodInvestments: [
    {
      investmentId: '39716c32-cab8-498b-9cb4-6f3bd90e8ffe',
      amount: {
        value: 1000.0,
        formatted: '$1,000',
      },
      gracePeriodEnd: dayjs().add(18, 'day').format('YYYY-MM-DDTHH:mm:ss'),
    },
  ],
  eligibleForWithdrawal: {
    value: 5000.0,
    formatted: '$5,000',
  },
  accountValue: {
    value: 6579.0,
    formatted: '$6,579',
  },
  penaltiesFee: {
    value: 1579.0,
    formatted: '$1,579',
  },
  date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  canWithdraw: false,
};

const fundsWithdrawalRequestMock = (status: string) => ({
  ...fundsWithdrawalSimulationMock,
  status,
});

export const Withdrawals = {
  typeDefs: schema,
  resolvers: {
    Query: {
      simulateFundsWithdrawal: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => fundsWithdrawalSimulationMock,
      getFundsWithdrawalRequest: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) =>
        fundsWithdrawalRequestMock('AWAITING_DECISION'),
      getDividend: async (parent: any, { dividendId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        const dividend = await api.getDividend(profileId, dividendId);

        if (!dividend) {
          throw new GraphQLError('Dividend not found');
        }

        return dividend;
      },
    },
    Mutation: {
      reinvestDividend: async (parent: any, { accountId, dividendIds }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Investments.ApiType>(Investments);
        const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);
        const { portfolioId } = await portfolioApi.getActivePortfolio();

        return api.reinvestDividends(profileId, accountId, portfolioId, dividendIds);
      },
      withdrawDividend: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => {
        let decision = true;
        dividendIds.map((id: string) => {
          const dividend = notificationsMock('', false).find(n => n.onObject?.id === id);
          decision = decision && !!dividend;
        });

        return decision;
      },

      createFundsWithdrawalRequest: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) =>
        fundsWithdrawalRequestMock('AWAITING_SIGNING_AGREEMENT'),
      createFundsWithdrawalAgreement: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => ({
        id: '87ed1f21-3eeb-4705-944a-3d6971669a32',
        url: 'https://some-url.com',
      }),
      requestFundsWithdrawal: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) =>
        fundsWithdrawalRequestMock('AWAITING_DECISION'),
      abortFundsWithdrawalRequest: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => true,
    },
  },
};
