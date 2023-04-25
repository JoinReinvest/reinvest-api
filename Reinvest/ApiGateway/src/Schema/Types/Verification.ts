import { SessionContext } from 'ApiGateway/index';
import { Verification } from 'Verification/index';

const schema = `
    #graphql
    enum ActionName {
        UPDATE_MEMBER
        BAN_ACCOUNT
        BAN_PROFILE
        REQUIRE_MANUAL_REVIEW
        REQUIRE_ADMIN_SUPPORT
    }

    enum VerificationObjectType {
        PROFILE
        COMPANY
        STAKEHOLDER
    }

    type VerificationObject {
        type: VerificationObjectType!
        accountId: String
        stakeholderId: String
    }

    type VerificationAction {
        action: ActionName!
        onObject: VerificationObject!
        reasons: [String]
    }

    type VerificationDecision {
        isAccountVerified: Boolean!
        canUserContinueTheInvestment: Boolean!
        requiredActions: [VerificationAction]
    }

    type Mutation {
        """
        It returns 'VerificationDecisions':
        * 'isAccountVerified: Boolean': it tells if all account's parties are verified or not
        * 'canUserContinueTheInvestment: Boolean': it tells can user continue the investment or not. If not then user
        must do extra actions to continue the investment
        * 'requiredActions': list of actions that user must perform to continue the investement.
        * [IMPORTANT] Some actions ban profile or accounts

        Action structure:
        - action: type of action. Based on that application must do some specific action
        - onObject: specifies the object that is a subject of an actions. It contains 2 fields:
        * type: type of object. It can be one of: 'PROFILE', 'STAKEHOLDER', 'COMPANY'
        * optional accountId (apply to 'STAKEHOLDER' and 'COMPANY')
        * optional stakeholderId (apply to 'STAKEHOLDER')
        - reasons: list of errors, suggestions what went wrong during verification. Potentially it can be used
        to display to user what went wrong

        List of current actions:
        * 'UPDATE_MEMBER': it means that user must update details of object specified in 'onObject' field
        * 'BAN_ACCOUNT': it means that account must be banned and investment process and all other investments
        are blocked
        * 'BAN_PROFILE': it means that profile must be banned and all accounts are blocked
        * 'REQUIRE_MANUAL_REVIEW' or 'REQUIRE_ADMIN_SUPPORT': just information, no action on frontend is required ('canUserContinueTheInvestment' should be set to 'true')
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
