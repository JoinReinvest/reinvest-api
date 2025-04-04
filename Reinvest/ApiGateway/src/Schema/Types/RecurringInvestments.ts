import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import { USDInput } from 'ApiGateway/Schema/Types/Investments';
import { Investments as InvestmentsModule } from 'Reinvest/Investments/src';
import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from 'Reinvest/Investments/src/Domain/Investments/Types';
import { LegalEntities } from 'Reinvest/LegalEntities/src';
import Modules from 'Reinvest/Modules';
import { Portfolio } from 'Reinvest/Portfolio/src';

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
        It returns the current recurring investment summary.
        """
        getActiveRecurringInvestment(accountId: ID!): RecurringInvestment

        """
        It returns the created draft recurring investment summary.
        """
        getDraftRecurringInvestment(accountId: ID!): RecurringInvestment

        """
        Returns the simulation of the recurring investment schedule.
        """
        getScheduleSimulation(schedule: RecurringInvestmentScheduleInput!): [ISODate!]!
    }

    type Mutation {
        """
        It creates new investment and returns its ID.
        It requires bank account to be linked to the account.
        In other case it throws an error.
        """
        createRecurringInvestment(accountId: ID!, amount: USDInput!, schedule: RecurringInvestmentScheduleInput!): RecurringInvestment!

        """
        It creates new subscription agreement for the specific recurring investment
        It returns the content of the agreement that must be rendered on the client side.
        Client must sign the agreement and call signRecurringInvestmentSubscriptionAgreement mutation.
        """
        createRecurringSubscriptionAgreement(accountId: ID!): SubscriptionAgreement!

        """
        It signs the recurring investment subscription agreement.
        """
        signRecurringInvestmentSubscriptionAgreement(accountId: ID!): Boolean!

        """
        It STARTS the recurring investment, CANCEL previous recurring investment if exists and schedule the first investment.
        """
        initiateRecurringInvestment(accountId: ID!): Boolean!

        """
        It DEACTIVATE the recurring investment.
        """
        deactivateRecurringInvestment(accountId: ID!): Boolean!

        """
        It UNSUSPEND the recurring investment.
        """
        unsuspendRecurringInvestment(accountId: ID!): Boolean!
    }
`;

export type Schedule = {
  frequency: RecurringInvestmentFrequency;
  startDate: string;
};

export type GetScheduleSimulation = {
  schedule: Schedule;
};

export type CreateRecurringInvestmentInput = {
  accountId: string;
  amount: USDInput;
  schedule: Schedule;
};

export async function mapAccountIdToParentAccountIdIfRequired(profileId: string, accountId: string, modules: Modules): Promise<string> {
  const api = modules.getApi<LegalEntities.ApiType>(LegalEntities);

  return api.mapAccountIdToParentAccountIdIfRequired(profileId, accountId);
}

export const RecurringInvestments = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getActiveRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);
        const recurringInvestment = await investmentAccountsApi.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.ACTIVE);

        if (!recurringInvestment) {
          return null;
        }

        return recurringInvestment;
      },
      getDraftRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);
        const recurringInvestment = await investmentAccountsApi.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.DRAFT);

        if (!recurringInvestment) {
          return null;
        }

        return recurringInvestment;
      },
      getScheduleSimulation: async (parent: any, { schedule }: GetScheduleSimulation, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);
        const { startDate, frequency } = schedule;

        return investmentAccountsApi.getScheduleSimulation(startDate, frequency);
      },
    },
    Mutation: {
      createRecurringInvestment: async (
        parent: any,
        { accountId, amount, schedule }: CreateRecurringInvestmentInput,
        { profileId, modules, throwIfBanned }: SessionContext,
      ) => {
        throwIfBanned(accountId);
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);
        const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);
        const { portfolioId } = await portfolioApi.getActivePortfolio();

        const status = await investmentAccountsApi.createDraftRecurringInvestment(portfolioId, profileId, accountId, amount, schedule);

        if (!status) {
          throw new JsonGraphQLError('COULDNT_CREATE_RECURRING_INVESTMENT');
        }

        return investmentAccountsApi.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.DRAFT);
      },
      createRecurringSubscriptionAgreement: async (parent: any, { accountId }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        throwIfBanned(accountId);
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const subscriptionAgreementId = await investmentAccountsApi.createRecurringSubscriptionAgreement(profileId, accountId);

        if (!subscriptionAgreementId) {
          throw new JsonGraphQLError('COULDNT_CREATE_SUBSCRIPTION');
        }

        const subscriptionAgreement = await investmentAccountsApi.subscriptionAgreementQuery(profileId, subscriptionAgreementId);

        return subscriptionAgreement;
      },
      signRecurringInvestmentSubscriptionAgreement: async (
        parent: any,
        { accountId }: any,
        { profileId, modules, clientIp, throwIfBanned }: SessionContext,
      ) => {
        throwIfBanned(accountId);
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);
        const isSigned = await investmentAccountsApi.signRecurringSubscriptionAgreement(profileId, accountId, clientIp);

        if (!isSigned) {
          throw new JsonGraphQLError('CANNOT_SIGN_RECURRING_SUBSCRIPTION_AGREEMENT');
        }

        return isSigned;
      },
      initiateRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        throwIfBanned(accountId);
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const status = await investmentAccountsApi.initiateRecurringInvestment(profileId, accountId);

        return status;
      },
      deactivateRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const status = await investmentAccountsApi.deactivateRecurringInvestment(profileId, accountId);

        return status;
      },
      unsuspendRecurringInvestment: async (parent: any, { accountId }: any, { profileId, modules, throwIfBanned }: SessionContext) => {
        throwIfBanned(accountId);
        const investmentAccountsApi = modules.getApi<InvestmentsModule.ApiType>(InvestmentsModule);

        const status = await investmentAccountsApi.unsuspendRecurringInvestment(profileId, accountId);

        return status;
      },
    },
  },
};
