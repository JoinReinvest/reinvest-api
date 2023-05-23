import { SessionContext } from 'ApiGateway/index';
import { subscriptionAgreementIdMock } from 'ApiGateway/Schema/Types/Investments';
import { subscriptionAgreements } from 'Reinvest/Investments/src/Domain/SubscriptionAgreement';

const subscriptionAgreementMock = (parentId: string, type: string) => ({
  id: subscriptionAgreementIdMock,
  type,
  status: 'WAITING_FOR_SIGNATURE',
  createdAt: '2023-03-24T12:33:12',
  content: subscriptionAgreements[1],
});

const schema = `
    #graphql
    enum RecurringInvestmentFrequency {
        WEEKLY
        BI_WEEKLY
        MONTHLY
        QUARTERLY
    }

    enum RecurringInvestmentStatus {
        DRAFT
        WAITING_FOR_SIGNING_SUBSCRIPTION_AGREEMENT
        ACTIVE
        SUSPENDED
        INACTIVE
    }

    input RecurringInvestmentScheduleInput {
        startDate: ISODate!
        frequency: RecurringInvestmentFrequency!
    }

    type RecurringInvestmentSchedule {
        startDate: ISODate!
        frequency: RecurringInvestmentFrequency!
    }

    type RecurringInvestment {
        id: ID!
        schedule: RecurringInvestmentSchedule!
        nextInvestmentDate: ISODate!
        amount: USD!
        subscriptionAgreementId: ID
        status: RecurringInvestmentStatus!
    }

    type Query {
        """
        [MOCK] It returns the current recurring investment summary.
        """
        getActiveRecurringInvestment(accountId: ID!): RecurringInvestment

        """
        [MOCK] It returns the created draft recurring investment summary.
        """
        getDraftRecurringInvestment(accountId: ID!): RecurringInvestment

        """
        [MOCK] Returns the simulation of the recurring investment schedule.
        """
        getScheduleSimulation(schedule: RecurringInvestmentScheduleInput!): [ISODate!]!
    }

    type Mutation {
        """
        [MOCK] It creates new investment and returns its ID.
        It requires bank account to be linked to the account.
        In other case it throws an error.
        """
        createRecurringInvestment(accountId: ID!, amount: USDInput!, schedule: RecurringInvestmentScheduleInput!): RecurringInvestment!

        """
        [MOCK] It creates new subscription agreement for the specific recurring investment
        It returns the content of the agreement that must be rendered on the client side.
        Client must sign the agreement and call signRecurringInvestmentSubscriptionAgreement mutation.
        """
        createRecurringSubscriptionAgreement(accountId: ID!): SubscriptionAgreement!

        """
        [MOCK] It signs the recurring investment subscription agreement.
        """
        signRecurringInvestmentSubscriptionAgreement(accountId: ID!): Boolean!

        """
        [MOCK] It STARTS the recurring investment, CANCEL previous recurring investment if exists and schedule the first investment.
        """
        initiateRecurringInvestment(accountId: ID!): Boolean!
    }
`;
const recurringInvestmentIdMock = '89e94d4c-f237-4f10-aa05-be8ade28123';
const recurringInvestmentMock = (status: string) => ({
  id: recurringInvestmentIdMock,
  schedule: {
    startDate: '2023-06-01',
    frequency: 'MONTHLY',
  },
  nextInvestmentDate: '2023-06-01',
  amount: {
    value: '1000.00',
    formatted: '$1,000.00',
  },
  subscriptionAgreementId: subscriptionAgreementIdMock,
  status,
});

export const RecurringInvestments = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getActiveRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        return recurringInvestmentMock('ACTIVE');
      },
      getDraftRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        return recurringInvestmentMock('DRAFT');
      },
      getScheduleSimulation: async (parent: any, { schedule }: any, { profileId, modules }: SessionContext) => {
        return ['2023-06-01', '2023-07-01', '2023-08-01', '2023-09-01'];
      },
    },
    Mutation: {
      createRecurringInvestment: async (parent: any, { accountId, amount, schedule }: any, { profileId, modules }: SessionContext) => {
        return recurringInvestmentMock('DRAFT');
      },
      createRecurringSubscriptionAgreement: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        return subscriptionAgreementMock(recurringInvestmentIdMock, 'RECURRING_INVESTMENT');
      },
      signRecurringInvestmentSubscriptionAgreement: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        return true;
      },
      initiateRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        return true;
      },
    },
  },
};
