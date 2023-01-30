import {SessionContext} from "ApiGateway/index";
import {Identity} from "Identity/index";

const schema = `
    #graphql
    type Mutation {
        setPhoneNumber(countryCode: String, phoneNumber: String): Boolean
        verifyPhoneNumber(countryCode: String, phoneNumber: String, authCode: String): Boolean
    }
`;


export const PhoneNumberVerification = {
    typeDefs: schema,
    resolvers: {
        Mutation: {
            setPhoneNumber: async (parent: any,
                                   {countryCode, phoneNumber}: { countryCode: string, phoneNumber: string },
                                   {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Identity.ApiType>(Identity);
                return api.setPhoneNumber(profileId, countryCode, phoneNumber);
            },
            verifyPhoneNumber: async (parent: any,
                                      {
                                          countryCode,
                                          phoneNumber,
                                          authCode
                                      }: { countryCode: string, phoneNumber: string, authCode: string },
                                      {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Identity.ApiType>(Identity);
                return api.verifyPhoneNumber(profileId, countryCode, phoneNumber, authCode);
            },
        }
    }
}

