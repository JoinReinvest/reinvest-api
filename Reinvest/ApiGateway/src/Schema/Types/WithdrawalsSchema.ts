import { SessionContext } from 'ApiGateway/index';
import { notificationsMock } from 'ApiGateway/Schema/Types/Notification';
import dayjs from 'dayjs';
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
        WITHDRAWING
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
        [MOCK] Get funds withdrawal request. It returns the current status of funds withdrawal request.
        """
        getFundsWithdrawalRequest(accountId: ID!): FundsWithdrawalRequest

        """
        [MOCK] Get funds withdrawal agreement
        """
        getFundsWithdrawalAgreement(accountId: ID!): FundsWithdrawalAgreement

    }
    type Mutation {
        """
        Reinvest dividend - you can reinvest many dividends in the same time. If one of them is not reinvestable, then all of them will be rejected.
        """
        reinvestDividend(accountId: ID!, dividendIds: [ID!]): Boolean!

        """
        [MOCK] Withdraw dividend - you can withdraw many dividends in the same time. If one of them is not withdrawable, then all of them will be rejected.
        """
        withdrawDividend(accountId: ID!, dividendIds: [ID!]): Boolean!

        """
        [MOCK] Create funds withdrawal request. It is just a DRAFT. You need to sign the agreement and then request the withdrawal.
        """
        createFundsWithdrawalRequest(accountId: ID!): FundsWithdrawalRequest!

        """
        [MOCK] It creates the funds withdrawal agreement.
        """
        createFundsWithdrawalAgreement(accountId: ID!): FundsWithdrawalAgreement!

        """
        [MOCK] It signs the agreement of funds withdrawal.
        """
        signFundsWithdrawalAgreement(accountId: ID!): FundsWithdrawalAgreement!

        """
        [MOCK] It requests the funds withdrawal. The investor must sign the agreement first.
        """
        requestFundsWithdrawal(accountId: ID!): FundsWithdrawalRequest!

        """
        [MOCK] It aborts the funds withdrawal request if it is not yet approved or rejected
        """
        abortFundsWithdrawalRequest(accountId: ID!): Boolean!
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
  createdDate: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  decisionDate: null,
  canWithdraw: false,
};

const agreementContentMock = [
  {
    paragraphs: [
      {
        lines: ['Funds Withdrawal Agreement'],
      },
      {
        lines: ['Agreement to subscribe for Series {{A123}}, a series of {{X7653}}'],
      },
    ],
  },
  {
    header: 'SUMMARY',
    paragraphs: [
      {
        lines: [
          '{{Legal name of Purchaser (Individual or Entity)}}: {(fullName)}',
          '{{Date of Agreement}}: {(dateOfBirth)}',
          '{{Number of Series A123, Interests subscribed for}}: {(fullName)}',
          '{{Price of Series A123 Interests subscribed for}}: {(fullName)}',
          '{{Telephone Number}}: {(telephoneNumber)}',
          '{{E-mail Address}}: {(email)}',
        ],
      },
      {
        lines: ['By clicking “I Agree” I, Purchaser, have executed this Subscription Agreement intended to be legally bound'],
      },
    ],
  },
  {
    header: 'IMPORTANT',
    paragraphs: [
      {
        lines: [
          'This Subscription Agreement and the Operating Agreement are legal agreements between you and ____________\n' +
            '(company name) pertaining to your investment in _________ (series name). Your investment in membership interests\n' +
            'in ____________ (the "Series (name) Interests") is contingent upon you accepting all of terms and conditions contained\n' +
            'in this Subscription Agreement and the Operating Agreement. The offering of the Series (name) Interests (the\n' +
            '"Offering") is described in the Offering Circular which is available at ___________ and at the U.S. Securities and\n' +
            'Exchange Commission’s EDGAR website located at www.sec.gov. Please carefully read this Subscription Agreement,\n' +
            'the Operating Agreement and the Offering Circular before making an investment. This Subscription Agreement and\n' +
            'the Operating Agreement contain certain representations by you and set forth certain rights and obligations\n' +
            'pertaining to you,_________________, and your investment in ___________. The Offering Circular contains important\n' +
            'information about the Series _____________ Interests and the terms and conditions of the Offering.',
        ],
      },
    ],
  },
  {
    header: 'Check the applicable box:',
    paragraphs: [
      {
        lines: [
          '{{(a) I am an "accredited investor", and have checked the appropriate box on the attached Certificate of\n' +
            'Accredited Investor Status indicating the basis of such accredited investor status, which Certificate of\n' +
            'Accredited Investor Status is true and correct; or}}',
        ],
        isCheckedOption: false,
      },
      {
        lines: [
          '{{(b) The amount set forth on the first page of this Subscription Agreement, together with any previous\n' +
            'investments in securities pursuant to this offering, does not exceed 10% of the greater of my net worth or\n' +
            'annual income.}}',
        ],
        isCheckedOption: true,
      },
      {
        lines: [
          'Are you or anyone in your immediate household, or, for any non-natural person, any officers, directors, or\n' +
            'any person that owns or controls 5% (or greater) of the quity, associated with a FINRA member, organization,\n' +
            'or the SEC',
          'NO',
        ],
      },
      {
        lines: [
          'Are you or anyone in your household or immediate family, or, for any non-natural person, any of its\n' +
            'directors, trustees, 10% (or more) equity holder, an officer, or member of the board of directors of a publicly traded company?',
          '{{YES}}',
          '{{Traded Company ticker symbols}}: RDW, TSLA, AAPL',
        ],
      },
    ],
  },
];

const fundsWithdrawalAgreementMock = {
  id: '98e94d4c-f237-4f10-aa05-be8ade2ffee',
  status: 'WAITING_FOR_SIGNATURE',
  createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  signedAt: null,
  content: agreementContentMock,
};

const fundsWithdrawalRequestMock = (status: string) => ({
  ...fundsWithdrawalSimulationMock,
  status,
});

export const WithdrawalsSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      simulateFundsWithdrawal: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Withdrawals.ApiType>(Withdrawals);

        return api.simulateWithdrawals(profileId, accountId);
      },
      getFundsWithdrawalRequest: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) =>
        fundsWithdrawalRequestMock('AWAITING_DECISION'),
      getDividend: async (parent: any, { dividendId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        const dividend = await api.getDividend(profileId, dividendId);

        if (!dividend) {
          throw new GraphQLError('Dividend not found');
        }

        return dividend;
      },
      listDividends: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        return {
          dividendsList: [
            {
              id: '98e94d4c-f237-4f10-aa05-be8ade2ffee',
              status: 'REINVESTED',
              date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
              amount: {
                value: 2245,
                formatted: '$22.45',
              },
            },
            {
              id: '988e94d4c-f237-4f10-aa05-be8ade2ffaa',
              status: 'PENDING',
              date: dayjs().subtract(30, 'day').format('YYYY-MM-DDTHH:mm:ss'),
              amount: {
                value: 2855,
                formatted: '$28.55',
              },
            },
          ],
        };
      },
      getFundsWithdrawalAgreement: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => fundsWithdrawalAgreementMock,
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

      createFundsWithdrawalRequest: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) =>
        fundsWithdrawalRequestMock('AWAITING_SIGNING_AGREEMENT'),
      createFundsWithdrawalAgreement: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => fundsWithdrawalAgreementMock,
      requestFundsWithdrawal: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) =>
        fundsWithdrawalRequestMock('AWAITING_DECISION'),
      abortFundsWithdrawalRequest: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => true,
    },
  },
};
