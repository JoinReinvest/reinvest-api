const schema = `
    #graphql
    enum BankAccountStatus {
        ACTIVE
        INACTIVE
        DRAFT
    }

    type BankAccount {
        accountNumber: String
        accountType: String
        bankName: String
        bankAccountStatus: BankAccountStatus
    }

    enum InvestmentStatus {
        WAITING_FOR_SUBSCRIPTION_AGREEMENT
        WAITING_FOR_FEES_APPROVAL
        WAITING_FOR_INVESTMENT_START
        IN_PROGRESS
        FUNDED
        FAILED
        FINISHED
        CANCELED
        CANCELING
        TRANSFERRED
        SETTLING
        REVERTED
    }

    type Investment {
        id: ID!
        accountId: ID!
        profileId: ID!
        tradeId: String!
        createdAt: ISODateTime!
        amount: USD!
        status: InvestmentStatus!
        investmentFees: USD
        subscriptionAgreementId: ID
        bankAccount: BankAccount
    }

    type Query {
        getUserInvestments(profileId: ID!): [Investment]
    }

    type Mutation {
        cancelUserInvestment(profileId: ID!, investmentId: ID!): Investment
    }
`;

export const InvestmentsSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      // getPortfolioDetails: async (parent: any, { data }: any, { modules, isAdmin }: AdminSessionContext) => {
      //   if (!isAdmin) {
      //     throw new GraphQLError('Access denied');
      //   }
      //
      //   const api = modules.getApi<Portfolio.ApiType>(Portfolio);
      //
      //   const { portfolioId } = await api.getActivePortfolio();
      //
      //   return api.getPortfolioDetails(portfolioId);
      // },
    },
    Mutation: {},
  },
};
