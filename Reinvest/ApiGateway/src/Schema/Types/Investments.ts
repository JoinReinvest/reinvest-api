import { SessionContext } from 'ApiGateway/index';
import { GraphQLError } from 'graphql';
import { Investments as InvestmentsApi } from 'Reinvest/Investments/src';

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

export const subscriptionAgreementMock = (parentId: string, type: string) => ({
  id: subscriptionAgreementIdMock,
  type,
  status: 'WAITING_FOR_SIGNATURE',
  createdAt: '2023-03-24T12:33:12',
  content: [
    {
      paragraphs: [
        {
          lines: ['{{Series A123}}', '{{A series of X7653}}'],
        },
        {
          lines: ['Interests are offered through Dalmore Group, LLC, a registered broker-dealer and member of FINRA and SIPC ("Dalmore" or the "BOR").'],
        },
        {
          lines: ['Subscription Agreement to subscribe for Series {{A123}}, a series of {{X7653}}'],
        },
      ],
    },
    {
      header: 'SUMMARY',
      paragraphs: [
        {
          lines: [
            '{{Legal name of Purchaser (Individual or Entity)}}: John Smith',
            '{{Date of Agreement}}: 03/24/2023',
            '{{Number of Series A123, Interests subscribed for}}: John Smith',
            '{{Price of Series A123 Interests subscribed for}}: John Smith',
            '{{Telephone Number}}: +17778887775',
            '{{E-mail Address}}: john.smith@gmail.com',
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
  ],
});

export type USDInput = {
  value: number;
};

export type CreateInvestment = {
  accountId: string;
  amount: USDInput;
};

export const Investments = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getInvestmentSummary: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        return investmentSummaryMock;
      },
      getSubscriptionAgreement: async (parent: any, { subscriptionAgreementId }: any, { profileId, modules }: SessionContext) => {
        return subscriptionAgreementMock(investmentIdMock, 'DIRECT_DEPOSIT');
      },
    },
    Mutation: {
      createInvestment: async (parent: any, { accountId, amount }: CreateInvestment, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsApi.ApiType>(InvestmentsApi);
        const investmentId = investmentAccountsApi.createInvestment(profileId, accountId, amount);

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
      createSubscriptionAgreement: async (parent: any, { investmentId, accountId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsApi.ApiType>(InvestmentsApi);

        const subscriptionAgreement = investmentAccountsApi.createSubscriptionAgreement(profileId, accountId, investmentId);

        return subscriptionAgreementMock(investmentIdMock, 'DIRECT_DEPOSIT');
      },
      signSubscriptionAgreement: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        return true;
      },
      abortInvestment: async (parent: any, { investmentId }: any, { profileId, modules }: SessionContext) => {
        return true;
      },
    },
  },
};
