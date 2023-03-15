import {SessionContext} from "ApiGateway/index";
import {Identity} from "Identity/index";
import {GraphQLError} from "graphql";

const schema = `
    #graphql
    "User invitation/referral/incentive token link to share with others"
    type UserInvitationLink {
        url: String
    }

    type Query {
        """
        Returns invitation link with a valid referral code (incentive token)
        """
        userInvitationLink: UserInvitationLink

        """
        [MOCK] Returns information if user already assigned and verified phone number
        """
        phoneCompleted: Boolean
    }
    type Mutation {
        """
        Add phone number. The system will send the verification code to the provided phone number via sms.
        """
        setPhoneNumber(countryCode: String, phoneNumber: String): Boolean
        """
        Verify phone number with received verification code on sms.
        This action will set the phone number in the user Cognito profile and allow to use 2FA with phone number
        """
        verifyPhoneNumber(countryCode: String, phoneNumber: String, authCode: String): Boolean
    }
`;


export const PhoneNumberVerification = {
    typeDefs: schema,
    resolvers: {
        Query: {
            phoneCompleted: async (parent: any,
                                   input: undefined,
                                   {profileId, modules}: SessionContext
            ) => true,
            userInvitationLink: async (parent: any,
                                       data: any,
                                       {userId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Identity.ApiType>(Identity);
                const incentiveLink = await api.getUserInvitationLink(userId);
                if (incentiveLink === null) {
                    throw new GraphQLError('Link does not exist');
                }

                return {url: incentiveLink};
            },
        },
        Mutation: {
            setPhoneNumber: async (parent: any,
                                   {countryCode, phoneNumber}: { countryCode: string, phoneNumber: string },
                                   {userId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Identity.ApiType>(Identity);
                return api.setPhoneNumber(userId, countryCode, phoneNumber);
            },
            verifyPhoneNumber: async (parent: any,
                                      {
                                          countryCode,
                                          phoneNumber,
                                          authCode
                                      }: { countryCode: string, phoneNumber: string, authCode: string },
                                      {userId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Identity.ApiType>(Identity);
                return api.verifyPhoneNumber(userId, countryCode, phoneNumber, authCode);
            },
        }
    }
}

