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
        userInvitationLink: UserInvitationLink
    }
    type Mutation {
        setPhoneNumber(countryCode: String, phoneNumber: String): Boolean
        verifyPhoneNumber(countryCode: String, phoneNumber: String, authCode: String): Boolean
    }
`;


export const PhoneNumberVerification = {
    typeDefs: schema,
    resolvers: {
        Query: {
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

