import { SessionContext } from 'ApiGateway/index';
import { notificationsMock } from 'ApiGateway/Schema/Types/Notification';

const schema = `
    #graphql
    type Mutation {
        """
        [MOCK] Reinvest dividend - you can reinvest many dividends in the same time. If one of them is not reinvestable, then all of them will be rejected.
        """
        reinvestDividend(dividendIds: [String!]): Boolean!

        """
        [MOCK] Withdraw dividend - you can withdraw many dividends in the same time. If one of them is not withdrawable, then all of them will be rejected.
        """
        withdrawDividend(dividendIds: [String!]): Boolean!
    }

`;

export const Withdrawals = {
  typeDefs: schema,
  resolvers: {
    Mutation: {
      reinvestDividend: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => {
        let decision = true;
        dividendIds.map((id: string) => {
          const dividend = notificationsMock('', false).find(n => n.onObject?.id === id);
          decision = decision && !!dividend;
        });

        return decision;
      },
      withdrawDividend: async (parent: any, { dividendIds }: any, { profileId, modules }: SessionContext) => {
        let decision = true;
        dividendIds.map((id: string) => {
          const dividend = notificationsMock('', false).find(n => n.onObject?.id === id);
          decision = decision && !!dividend;
        });

        return decision;
      },
    },
  },
};
