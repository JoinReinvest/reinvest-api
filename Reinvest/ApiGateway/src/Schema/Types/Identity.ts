import {SessionContext} from "ApiGateway/index";

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
                                   input: undefined,
                                   {profileId, modules}: SessionContext
            ) => true,
            verifyPhoneNumber: async (parent: any,
                                      input: undefined,
                                      {profileId, modules}: SessionContext
            ) => true
        }
    }
}

