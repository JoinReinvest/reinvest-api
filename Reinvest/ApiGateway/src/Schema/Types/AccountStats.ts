import { SessionContext } from 'ApiGateway/index';
import dayjs from 'dayjs';
import { SharesAndDividends } from 'SharesAndDividends/index';

const schema = `
    #graphql
    enum EVSChartResolution {
        DAY
        WEEK
        MONTH
        YEAR
        FIVE_YEARS
        MAX
    }

    type EVSChartPoint {
        usd: Float!
        date: ISODate!
    }

    type EVSChart {
        resolution: EVSChartResolution
        startAt: ISODate!
        endAt: ISODate!
        changeFactor: String!
        dataPoints: [EVSChartPoint]
    }

    type AccountStats {
        accountValue: String!
        EVS: String!
        costOfSharesOwned: String!
        quantityOfShares: String!
        currentNAVPerShare: String!
        netReturns: String!
        dividends: String!
        appreciation: String!
        advisorFees: String!
    }

    type AccountActivity {
        activityName: String!
        date: ISODate!
    }

    type Query {
        """
        [MOCK] Get EVS chart data for an account by resolution
        """
        getEVSChart(accountId: ID!, resolution: EVSChartResolution!): EVSChart

        """
        [MOCK] Get account stats
        """
        getAccountStats(accountId: ID!): AccountStats

        """
        [MOCK] Get account activities
        Activities Types:
        - PROFILE_CREATED
        - INDIVIDUAL/CORPORATE/TRUST/BENEFICIARY_ACCOUNT_CREATED
        - INDIVIDUAL/CORPORATE/TRUST/BENEFICIARY_ACCOUNT_UPDATED
        - INVESTMENT_CREATED
        - INVESTMENT_FAILED
        - INVESTMENT_CANCELED
        - INVESTMENT_FINISHED
        - FUNDS_WITHDRAWAL_CREATED
        - FUNDS_WITHDREW
        - BENEFICIARY_ACCOUNT_ARCHIVED
        - SHARES_ISSUED
        - DIVIDEND_RECEIVED
        - REFERRAL_REWARD_RECEIVED
        - EMAIL_UPDATED
        - DIVIDEND_REINVESTED
        - DIVIDEND_WITHDREW
        - ACCOUNT_BANNED
        - PROFILE_BANNED
        - ACCOUNT_UNBANNED
        - PROFILE_UNBANNED
        - RECURRING_INVESTMENT_CREATED
        - RECURRING_INVESTMENT_SUSPENDED
        - RECURRING_INVESTMENT_ARCHIVED
        - VERIFICATION_FAILED

        DB: Type, uniqueKey, contentFields, dateCreated, profileId, accountId (can be null)
        """
        getAccountActivity(accountId: ID!, pagination: Pagination = {page: 0, perPage: 10}): [AccountActivity]!
    }
`;

export const AccountStats = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getAccountStats: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        return api.getAccountStats(profileId, accountId);
      },
      getAccountActivity: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        return [
          {
            activityName: 'User email updated to t****@test.com',
            date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
          },
          {
            activityName: '$400 invested',
            date: dayjs().subtract(23, 'day').format('YYYY-MM-DD'),
          },
          {
            activityName: '$22.45 dividend received',
            date: dayjs().subtract(16, 'day').format('YYYY-MM-DD'),
          },
        ];
      },
      getEVSChart: async (parent: any, { accountId, resolution }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        return api.getEVSChart(profileId, accountId, resolution);
      },
    },
  },
};
