import { JsonGraphQLError, SessionContext } from 'ApiGateway/index';
import { LegalEntities } from 'LegalEntities/index';
import { Registration } from 'Registration/index';
import { Verification } from 'Verification/index';

const schema = `
    #graphql
    enum ActionName {
        UPDATE_MEMBER
        UPDATE_MEMBER_AGAIN
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
        * 'UPDATE_MEMBER' or 'UPDATE_MEMBER_AGAIN': it means that user must update details of object specified in 'onObject' field
        * 'BAN_ACCOUNT': it means that account must be banned and investment process and all other investments
        are blocked
        * 'BAN_PROFILE': it means that profile must be banned and all accounts are blocked
        * 'REQUIRE_MANUAL_REVIEW' or 'REQUIRE_ADMIN_SUPPORT': just information, no action on frontend is required ('canUserContinueTheInvestment' should be set to 'true')
        """
        verifyAccount(accountId: String): VerificationDecision

        """
        [WIP] It does not work yet.
        """
        updateProfileForVerification(input: UpdateProfileForVerificationInput!): Boolean

        """
        [WIP] It does not work yet.
        """
        updateStakeholderForVerification(accountId: String, stakeholderId: String, input: UpdateStakeholderForVerificationInput!): Boolean

        """
        [WIP] It does not work yet.
        """
        updateCompanyForVerification(accountId: String, input: UpdateCompanyForVerificationInput!): Boolean
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
      updateProfileForVerification: async (parent: any, { input }: any, { profileId, modules }: SessionContext): Promise<boolean> => {
        const legalEntitiesApi = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const verificationApi = modules.getApi<Verification.ApiType>(Verification);
        const registrationApi = modules.getApi<Registration.ApiType>(Registration);

        const canObjectBeUpdate = await verificationApi.canObjectBeUpdated(profileId);

        if (!canObjectBeUpdate) {
          throw new JsonGraphQLError('NO_UPDATE_ALLOWED');
        }
        // const { input } = data;
        // const errors = await legalEntitiesApi.updateProfileForVerification(input, profileId);

        // if (errors.length > 0) {
        //   throw new JsonGraphQLError(errors);
        // }

        // const status = await registrationApi.synchronizeProfile(profileId);

        return await verificationApi.notifyAboutUpdate(profileId);
      },
      updateStakeholderForVerification: async (
        parent: any,
        { accountId, stakeholderId, input }: any,
        { profileId, modules }: SessionContext,
      ): Promise<boolean> => {
        const legalEntitiesApi = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const verificationApi = modules.getApi<Verification.ApiType>(Verification);
        const registrationApi = modules.getApi<Registration.ApiType>(Registration);

        const canObjectBeUpdate = await verificationApi.canObjectBeUpdated(stakeholderId);

        if (!canObjectBeUpdate) {
          throw new JsonGraphQLError('NO_UPDATE_ALLOWED');
        }
        // const { input } = data;
        // const errors = await legalEntitiesApi.updateProfileForVerification(input, stakeholderId);

        // if (errors.length > 0) {
        //   throw new JsonGraphQLError(errors);
        // }

        // const status = await registrationApi.synchronizeProfile(stakeholderId);

        return await verificationApi.notifyAboutUpdate(stakeholderId);
      },
      updateCompanyForVerification: async (parent: any, { accountId, input }: any, { profileId, modules }: SessionContext): Promise<boolean> => {
        const legalEntitiesApi = modules.getApi<LegalEntities.ApiType>(LegalEntities);
        const verificationApi = modules.getApi<Verification.ApiType>(Verification);
        const registrationApi = modules.getApi<Registration.ApiType>(Registration);

        const canObjectBeUpdate = await verificationApi.canObjectBeUpdated(accountId);

        if (!canObjectBeUpdate) {
          throw new JsonGraphQLError('NO_UPDATE_ALLOWED');
        }
        // const { input } = data;
        // const errors = await legalEntitiesApi.updateProfileForVerification(input, accountId);

        // if (errors.length > 0) {
        //   throw new JsonGraphQLError(errors);
        // }

        // const status = await registrationApi.synchronizeProfile(accountId);

        return await verificationApi.notifyAboutUpdate(accountId);
      },
    },
  },
};
