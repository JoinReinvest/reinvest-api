import { AdminSessionContext } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';
import { Investments } from 'Investments/index';

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
        tradeId: String!
        createdAt: ISODateTime!
        status: InvestmentStatus!
        subscriptionAgreementId: ID
        amount: USD!
    }

    type Query {
        listUserInvestments(profileId: ID!, accountId: ID!, pagination: Pagination = {page: 0, perPage: 30}): [Investment]
    }

    type Mutation {
        cancelUserInvestment(profileId: ID!, investmentId: ID!): Boolean
    }
`;

export const InvestmentsSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      listUserInvestments: async (parent: any, { profileId, accountId, pagination }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Investments.ApiType>(Investments);

        return api.listInvestments(profileId, accountId, pagination);
      },
    },
    Mutation: {
      cancelUserInvestment: async (parent: any, { profileId, investmentId }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Investments.ApiType>(Investments);

        return api.cancelInvestment(profileId, investmentId);
      },
    },
  },
};
