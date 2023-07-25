import { AdminSessionContext } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';
import { Withdrawals as WithdrawalsApi } from 'Withdrawals/index';

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
        agreementId: ID
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
        dividendId: ID
        eligibleAmount: String!
        status: DividendWithdrawalStatus!
        dateCreated: ISODateTime
        dateDecided: ISODateTime
    }

    enum FundsWithdrawalStatus {
        PENDING
        READY_TO_SEND
        COMPLETED
    }

    type Withdrawal {
        id: ID!
        status: FundsWithdrawalStatus!
        "Use getAdminDocument to download - if there were not funds withdrawals requests, then it will be null"
        redemptionId: ID
        "Use getAdminDocument to download"
        payoutId: ID!
        dateCreated: ISODateTime!
        dateCompleted: ISODateTime
    }

    type Query {
        "List pending investors withdrawal requests. Requests must be accepted or rejected by executive"
        listFundsWithdrawalsRequests(pagination: Pagination = {page: 0, perPage: 100}): [FundsWithdrawalRequest]

        "List all investors dividends withdrawals requests"
        listDividendWithdrawals(pagination: Pagination = {page: 0, perPage: 100}): [DividendWithdrawal]

        "List all withdrawals processes created by 'prepareWithdrawalDocuments' mutation"
        listWithdrawals(pagination: Pagination = {page: 0, perPage: 100}): [Withdrawal]
    }

    type Mutation {
        "It accepts funds withdrawals request sent by investors"
        acceptWithdrawalRequests(ids: [ID!]!): Boolean!

        "It rejects funds withdrawals request sent by investors"
        rejectWithdrawalRequests(ids: [ID!]!, reason: String!): Boolean!

        """
        It takes all accepted funds withdrawal and dividends withdrawal requests and generates documents
        that must be sent to Vertalo (redemption form) and North Capital (payout form) by admin to manually execute
        shares redemptions and transfer money to investors.
        """
        prepareWithdrawalDocuments: ID!

        """
        It pushes the process of preparing withdrawal documents (id returned by 'prepareWithdrawalDocuments' mutation)
        in case if it was interrupted or failed.
        """
        pushPreparingWithdrawalDocuments(withdrawalId: ID!): Boolean!

        "It marks withdrawal process as completed - it should be done only if all documents were sent to Vertalo and North Capital"
        markWithdrawalCompleted(withdrawalId: ID!): Boolean!
    }
`;

export const Withdrawals = {
  typeDefs: schema,
  resolvers: {
    Query: {
      listFundsWithdrawalsRequests: async (parent: any, { pagination }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);

        return api.listFundsWithdrawalsPendingRequests(pagination);
      },
      listDividendWithdrawals: async (parent: any, { pagination }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);

        return api.listDividendsWithdrawalsRequests(pagination);
      },
      listWithdrawals: async (parent: any, { pagination }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);

        return api.listWithdrawalsDocuments(pagination);
      },
    },
    Mutation: {
      acceptWithdrawalRequests: async (parent: any, { ids }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);

        return api.acceptWithdrawalRequests(ids);
      },
      rejectWithdrawalRequests: async (parent: any, { ids, reason }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);

        return api.rejectWithdrawalRequests(ids, reason);
      },
      prepareWithdrawalDocuments: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);

        return api.prepareWithdrawalDocuments();
      },
      pushPreparingWithdrawalDocuments: async (parent: any, { withdrawalId }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);
        await api.pushWithdrawalDocuments(withdrawalId);

        return true;
      },
      markWithdrawalCompleted: async (parent: any, { withdrawalId }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<WithdrawalsApi.ApiType>(WithdrawalsApi);
        await api.markWithdrawalAsCompleted(withdrawalId);

        return true;
      },
    },
  },
};
