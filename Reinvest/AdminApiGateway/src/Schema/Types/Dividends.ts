import { AdminSessionContext } from 'AdminApiGateway/index';
import dayjs from 'dayjs';
import { GraphQLError } from 'graphql';
import { Identity } from 'Identity/index';
import { Portfolio } from 'Portfolio/index';
import { RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { SharesAndDividends } from 'SharesAndDividends/index';

const schema = `
    #graphql
    enum RewardType {
        INVITER
        INVITEE
        BOTH
    }

    enum DividendDeclarationStatus {
        CALCULATING
        CALCULATED
    }

    type NumberOfSharesPerDay {
        date: ISODate
        numberOfShares: Float
    }

    type DividendsDeclaration {
        id: ID
        calculatingFromDate: ISODate
        declarationDate: ISODate
        createdDate: ISODateTime
        calculationFinishedDate: ISODateTime
        amount: String
        numberOfDays: Int
        numberOfSharesPerDay: [NumberOfSharesPerDay]
        unitAmountPerDay: String
        status: DividendDeclarationStatus
    }

    type DeclarationStats {
        inDividends: String
        inFees: String
    }

    type DividendsDeclarationStats {
        AWAITING_DISTRIBUTION: DeclarationStats
        DISTRIBUTED: DeclarationStats
        LOCKED: DeclarationStats
        REVOKED: DeclarationStats
        TOTAL: DeclarationStats
    }

    enum DividendDistributionStatus {
        DISTRIBUTING
        DISTRIBUTED
    }

    type DividendDistribution {
        id: ID
        distributeToDate: ISODate
        status: DividendDistributionStatus
    }

    type Query {
        listDividendsDeclarations: [DividendsDeclaration]

        getDividendDeclarationStats(declarationId: ID!): DividendsDeclarationStats
    }

    type Mutation {
        """
        @access: Executive
        Manually creates inventive reward for inviterEmail
        User can get many INVITER rewards.
        INVITER reward - when someone registers with INVITER invite link.
        """
        giveIncentiveRewardByHand(inviterEmail: EmailAddress, inviteeEmail: EmailAddress, whoShouldGetTheReward: RewardType): Boolean

        """
        @access: Executive
        Declare the dividend from the LAST declarationDate to the CURRENT declarationDate
        """
        declareDividend(amount: Int!, declarationDate: ISODate!): DividendsDeclaration

        """
        @access: Executive
        Distributes all AWAITING_DISTRIBUTION status until now
        """
        distributeDividends: DividendDistribution
    }
`;

export const DividendsSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      listDividendsDeclarations: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        return api.getDividendDeclarations();
      },

      getDividendDeclarationStats: async (parent: any, { declarationId }: { declarationId: string }, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);

        return api.getDividendDeclarationStats(declarationId);
      },
    },
    Mutation: {
      giveIncentiveRewardByHand: async (
        parent: any,
        {
          inviterEmail,
          inviteeEmail,
          whoShouldGetTheReward,
        }: {
          inviteeEmail: string;
          inviterEmail: string;
          whoShouldGetTheReward: 'INVITER' | 'INVITEE' | 'BOTH';
        },
        { modules, isExecutive }: AdminSessionContext,
      ) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const identityApi = modules.getApi<Identity.ApiType>(Identity);
        const inviterProfile = await identityApi.getProfileByEmail(inviterEmail);
        const inviteeProfile = await identityApi.getProfileByEmail(inviteeEmail);

        if (!inviterProfile || !inviteeProfile) {
          throw new GraphQLError('Inviter or invitee not found');
        }

        const { profileId: inviterProfileId } = inviterProfile;
        const { profileId: inviteeProfileId } = inviteeProfile;

        let inviterStatus = false;
        let inviteeStatus = false;

        if (whoShouldGetTheReward === 'INVITER' || whoShouldGetTheReward === 'BOTH') {
          inviterStatus = await api.createManuallyIncentiveReward(inviterProfileId, inviteeProfileId, RewardType.INVITER);
        }

        if (whoShouldGetTheReward === 'INVITEE' || whoShouldGetTheReward === 'BOTH') {
          inviteeStatus = await api.createManuallyIncentiveReward(inviterProfileId, inviteeProfileId, RewardType.INVITEE);
        }

        return inviterStatus || inviteeStatus;
      },
      declareDividend: async (
        parent: any,
        { amount, declarationDate }: { amount: number; declarationDate: string },
        { modules, isExecutive }: AdminSessionContext,
      ) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const date = dayjs(declarationDate).toDate();
        const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);
        const { portfolioId } = await portfolioApi.getActivePortfolio();

        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const error = await api.declareDividend(portfolioId, amount, date);

        if (error) {
          throw new GraphQLError(error);
        }

        return api.getDividendDeclarationByDate(date);
      },
      distributeDividends: async (parent: any, data: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const id = await api.createDividendDistribution();

        if (!id) {
          throw new GraphQLError('Cannot create dividend distribution');
        }

        return api.getDividendDistributionById(id);
      },
    },
  },
};
