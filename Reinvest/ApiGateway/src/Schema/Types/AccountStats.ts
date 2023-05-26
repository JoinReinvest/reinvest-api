import { SessionContext } from 'ApiGateway/index';
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

    type Query {
        """
        [MOCK] Get EVS chart data for an account by resolution
        """
        getEVSChart(accountId: String!, resolution: EVSChartResolution!): EVSChart

        """
        [MOCK] Get account stats
        """
        getAccountStats(accountId: String!): AccountStats
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
      getEVSChart: async (parent: any, { accountId, resolution }: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        return api.getEVSChart(profileId, accountId, resolution);
      },
    },
  },
};
