import { SessionContext } from 'ApiGateway/index';
import { SharesAndDividends } from 'SharesAndDividends/index';

const schema = `
    #graphql
    type AutomaticDividendReinvestmentAgreement {
        signed: Boolean!
        date: ISODateTime
    }

    type AccountConfiguration {
        automaticDividendReinvestmentAgreement: AutomaticDividendReinvestmentAgreement
    }

    type Query {
        """
        Return account configuration
        """
        getAccountConfiguration(accountId: ID!): AccountConfiguration
    }

    type Mutation {
        """
        Set automatic dividend reinvestment agreement
        """
        setAutomaticDividendReinvestmentAgreement(accountId: ID!, automaticDividendReinvestmentAgreement: Boolean!): Boolean!
    }
`;

type GetAccountConfiguration = {
  accountId: string;
};

type SetAutomaticDividendReinvestmentAgreement = {
  accountId: string;
  automaticDividendReinvestmentAgreement: boolean;
};

export const Configuration = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getAccountConfiguration: async (parent: any, { accountId }: GetAccountConfiguration, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const configuration = await api.getConfiguration(profileId, accountId);

        if (!configuration) {
          return null;
        }

        return configuration;
      },
    },
    Mutation: {
      setAutomaticDividendReinvestmentAgreement: async (
        parent: any,
        { accountId, automaticDividendReinvestmentAgreement }: SetAutomaticDividendReinvestmentAgreement,
        { profileId, modules, throwIfBanned }: SessionContext,
      ) => {
        throwIfBanned(accountId);
        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const status = await api.createConfiguration(profileId, accountId, automaticDividendReinvestmentAgreement);

        return status;
      },
    },
  },
};
