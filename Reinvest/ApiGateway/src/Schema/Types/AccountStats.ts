import { SessionContext } from 'ApiGateway/index';
import DateTime from 'date-and-time';

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

    type Query {
        """
        [MOCK] Get EVS chart data for an account by resolution
        """
        getEVSChart(accountId: String!, resolution: EVSChartResolution!): EVSChart
    }
`;

export const AccountStats = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getEVSChart: async (parent: any, { accountId, resolution }: any, { profileId, modules }: SessionContext) => {
        const lastThousandDays = [];
        let currentEVSValue = 0;

        for (let i = 0; i < 1000; i++) {
          switch (true) {
            case i % 30 === 0 && i < 365:
              currentEVSValue = currentEVSValue + 1000.36;
              break;
            case i % 91 === 0:
              currentEVSValue = currentEVSValue * 1.025;
              break;
            case i % 30 === 0 && i > 730:
              currentEVSValue = currentEVSValue + 500.77;
              break;
            default:
              break;
          }

          lastThousandDays.push(currentEVSValue);
        }

        const dataPoints = [];
        let date = new Date('2020-01-01');
        let firstValue = null;
        let lastValue = null;

        for (let i = 0; i < lastThousandDays.length; i++) {
          if (i === 0) {
            firstValue = lastThousandDays[i];
          }

          let addToDataPoints = false;
          switch (resolution) {
            case 'DAY':
            case 'MAX':
              addToDataPoints = true;
              break;
            case 'WEEK':
              if (i % 7 === 0) {
                addToDataPoints = true;
              }

              break;
            case 'MONTH':
              if (i % 30 === 0) {
                addToDataPoints = true;
              }

              break;
            case 'YEAR':
              if (i % 366 === 0) {
                addToDataPoints = true;
              }

              break;
            case 'FIVE_YEARS':
              if (i % 1825 === 0) {
                addToDataPoints = true;
              }

              break;
            default:
              break;
          }

          if (i === lastThousandDays.length - 1) {
            addToDataPoints = true;
          }

          if (addToDataPoints) {
            const dateISO = DateTime.format(date, 'YYYY-MM-DD', true);
            dataPoints.push({
              usd: Math.round(lastThousandDays[i] * 100) / 100,
              date: dateISO,
            });
          }

          if (i !== lastThousandDays.length - 1) {
            date = DateTime.addDays(date, 1);
          } else {
            lastValue = lastThousandDays[i];
          }
        }

        const changeFactor = Math.round(((((lastValue - firstValue) * 100) / firstValue) * 100) / 100);

        return {
          resolution,
          startAt: DateTime.format(new Date('2020-01-01'), 'YYYY-MM-DD', true),
          endAt: DateTime.format(date, 'YYYY-MM-DD', true),
          changeFactor: `${changeFactor}%`,
          dataPoints,
        };
      },
    },
  },
};
