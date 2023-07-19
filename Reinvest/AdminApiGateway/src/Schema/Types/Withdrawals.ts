import { AdminSessionContext } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';

const schema = `
    #graphql
    enum FundsWithdrawalRequestStatus {
        AWAITING_SIGNING_AGREEMENT
        DRAFT
        AWAITING_DECISION
        APPROVED
        REJECTED
    }

    type FundsWithdrawalRequest {
        id: ID!
        profileId: ID!
        accountId: ID!
        agreementId: ID!
        status: FundsWithdrawalRequestStatus!
        eligibleForWithdrawal: USD!
        accountValue: USD!
        penaltiesFee: USD!
        decisionMessage: String
        investorWithdrawalReason: String
        createdDate: ISODateTime!
        decisionDate: ISODateTime
        isCompleted: Boolean!
    }

    enum DividendWithdrawalStatus {
        REQUESTED
        REJECTED
        ACCEPTED
        AUTO_ACCEPTED
    }

    type DividendWithdrawal {
        id: ID!
        profileId: ID!
        accountId: ID!
        eligibleAmount: USD!
        status: DividendWithdrawalStatus!
        dateCreated: ISODateTime
        dateDecision: ISODateTime
        isCompleted: Boolean!
    }

    enum FundsWithdrawalStatus {
        PENDING
        READY_TO_SEND
        COMPLETED
    }

    type Withdrawal {
        id: ID!
        status: FundsWithdrawalStatus!
        "Use getAdminDocument to download"
        redemptionId: ID!
        "Use getAdminDocument to download"
        payoutId: ID!
        dateCreated: ISODateTime!
        dateCompleted: ISODateTime
    }

    type Query {
        "[MOCK]"
        listFundsWithdrawalsRequests(pagination: Pagination): [FundsWithdrawalRequest]

        "[MOCK]"
        listDividendWithdrawals(pagination: Pagination): [DividendWithdrawal]

        "[MOCK]"
        listWithdrawals(pagination: Pagination): [Withdrawal]
    }

    type Mutation {
        "[MOCK]"
        acceptWithdrawalRequests(ids: [ID!]!): Boolean!

        "[MOCK]"
        rejectWithdrawalRequests(ids: [ID!]!, reason: String!): Boolean!

        "[MOCK]"
        prepareWithdrawalDocuments: ID!

        "[MOCK]"
        markWithdrawalCompleted(withdrawalId: ID!): Boolean!
    }
`;

export const Withdrawals = {
  typeDefs: schema,
  resolvers: {
    Query: {
      listFundsWithdrawalsRequests: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        return null;
      },
      listDividendWithdrawals: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        return null;
      },
      listWithdrawals: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        return null;
      },
    },
    Mutation: {
      acceptWithdrawalRequests: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        return null;
      },
      rejectWithdrawalRequests: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        return null;
      },
      prepareWithdrawalDocuments: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        return null;
      },
      markWithdrawalCompleted: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        return null;
      },
    },
  },
};
