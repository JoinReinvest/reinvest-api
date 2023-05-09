import { SessionContext } from 'ApiGateway/index';

const schema = `
    #graphql
    type AutomaticDividendReinvestmentAgreement {
        signed: Boolean!
        date: ISODateTime
    }

    type AccountConfiguration {
        automaticDividendReinvestmentAgreement: AutomaticDividendReinvestmentAgreement!
    }

    type Query {
        """
        [MOCK] Return account configuration
        """
        getAccountConfiguration(accountId: ID!): AccountConfiguration!
    }

    type Mutation {
        """
        [MOCK] Set automatic dividend reinvestment agreement
        """
        setAutomaticDividendReinvestmentAgreement(accountId: ID!, automaticDividendReinvestmentAgreement: Boolean!): Boolean!
    }
`;

const accountConfigurationMock = {
  automaticDividendReinvestmentAgreement: {
    signed: false,
  },
};

export const Configuration = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getAccountConfiguration: async (parent: any, { accountId }: any, { profileId, modules }: SessionContext) => {
        return accountConfigurationMock;
      },
    },
    Mutation: {
      setAutomaticDividendReinvestmentAgreement: async (
        parent: any,
        { accountId, automaticDividendReinvestmentAgreement }: any,
        { profileId, modules }: SessionContext,
      ) => {
        return true;
      },
    },
  },
};
