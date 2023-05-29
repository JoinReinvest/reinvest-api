import { AdminSessionContext } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';
import { Identity } from 'Identity/index';
import { RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { SharesAndDividends } from 'SharesAndDividends/index';

const schema = `
    #graphql
    enum RewardType {
        INVITER
        INVITEE
        BOTH
    }

    type Mutation {
        """
        @access: Executive
        Manually creates inventive reward for inviterEmail
        User can get many INVITER rewards.
        INVITER reward - when someone registers with INVITER invite link.
        """
        giveIncentiveRewardByHand(inviterEmail: EmailAddress, inviteeEmail: EmailAddress, whoShouldGetTheReward: RewardType): Boolean
    }
`;

export const MoneyRelatedSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {},
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

        let status = true;

        if (whoShouldGetTheReward === 'INVITER' || whoShouldGetTheReward === 'BOTH') {
          status = status && (await api.createManuallyIncentiveReward(inviterProfileId, inviteeProfileId, RewardType.INVITER));
        }

        if (whoShouldGetTheReward === 'INVITEE' || whoShouldGetTheReward === 'BOTH') {
          status = status && (await api.createManuallyIncentiveReward(inviterProfileId, inviteeProfileId, RewardType.INVITEE));
        }

        return status;
      },
    },
  },
};
