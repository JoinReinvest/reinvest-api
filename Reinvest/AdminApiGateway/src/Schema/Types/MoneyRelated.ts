import { AdminSessionContext } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';
import { Identity } from 'Identity/index';
import { SharesAndDividends } from 'SharesAndDividends/index';

const schema = `
    #graphql

    type Mutation {
        """
        @access: Executive
        Manually creates inventive reward. User can get only one incentive reward, so every additional reward will be ignored.
        """
        giveInventiveRewardByHand(email: EmailAddress): Boolean
    }
`;

export const MoneyRelatedSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {},
    Mutation: {
      giveInventiveRewardByHand: async (parent: any, { email }: { email: string }, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<SharesAndDividends.ApiType>(SharesAndDividends);
        const identityApi = modules.getApi<Identity.ApiType>(Identity);
        const profile = await identityApi.getProfileByEmail(email);

        if (!profile) {
          throw new GraphQLError('Profile not found');
        }

        const { profileId } = profile;

        return api.createIncentiveReward(profileId);
      },
    },
  },
};
