import { SessionContext } from 'ApiGateway/index';
import { InvestmentAccounts } from 'Reinvest/InvestmentAccounts/src';

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
        [MOCK] Return account configuration
        """
        getAccountConfiguration(accountId: ID!): AccountConfiguration
    }

    type Mutation {
        """
        [MOCK] Set automatic dividend reinvestment agreement
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
        const investmentAccountsApi = modules.getApi<InvestmentAccounts.ApiType>(InvestmentAccounts);
        const configuration = await investmentAccountsApi.getConfiguration(profileId, accountId);

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
        const investmentAccountsApi = modules.getApi<InvestmentAccounts.ApiType>(InvestmentAccounts);
        const status = await investmentAccountsApi.createConfiguration(profileId, accountId, automaticDividendReinvestmentAgreement);

        return status;
      },
    },
  },
};
