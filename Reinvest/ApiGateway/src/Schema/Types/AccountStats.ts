import { SessionContext } from 'ApiGateway/index';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { Notifications } from 'Notifications/index';

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
        Get EVS chart data for an account by resolution
        """
        getEVSChart(accountId: ID!, resolution: EVSChartResolution!): EVSChart

        """
        Get account stats
        """
        getAccountStats(accountId: ID!): AccountStats

        """
        Get account activities
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
      getAccountActivity: async (parent: any, { accountId, pagination }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Notifications.ApiType>(Notifications);

        return api.listAccountActivities(profileId, accountId, pagination);
      },
      getEVSChart: async (parent: any, { accountId, resolution }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        return api.getEVSChart(profileId, accountId, resolution);
      },
    },
  },
};
