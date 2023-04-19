import { SessionContext } from 'ApiGateway/index';
import { Verification } from 'Verification/index';

const schema = `
    #graphql
    enum ActionName {
        UPDATE_PROFILE
        UPDATE_STAKEHOLDER
        UPDATE_COMPANY
        BAN_ACCOUNT
        BAN_PROFILE
    }

    type VerificationAction {
        action: ActionName!
        onObjectId: String
    }

    type VerificationDecision {
        isAccountVerified: Boolean!
        canUserContinueTheInvestment: Boolean!
        requiredActions: [VerificationAction]
    }

    type Mutation {
        """
        [WIP] Request verification of the account
        """
        verifyAccount(accountId: String): VerificationDecision
    }
`;

export const VerificationSchema = {
  typeDefs: schema,
  resolvers: {
    Mutation: {
      verifyAccount: async (
        parent: any,
        {
          accountId,
        }: {
          accountId: string;
        },
        { profileId, modules }: SessionContext,
      ) => {
        const api = modules.getApi<Verification.ApiType>(Verification);

        return api.verifyAccount(profileId, accountId);
      },
    },
  },
};
