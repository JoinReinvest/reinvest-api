import {SessionContext} from "ApiGateway/index";
import {Documents} from "Documents/index";

const schema = `
    #graphql
    input FileLinkInput {
        id: String!
    }

    type FileLink {
        url: String
        id: String
    }

    input GenericFieldInput {
        name: String!
        value: String!
    }

    enum TemplateName {
        SUBSCRIPTION_AGREEMENT
        AUTO_REINVESTMENT_AGREEMENT
    }

    type Template {
        templateName: TemplateName
        content: String
        fields: [String]
    }

    type SignatureId {
        signatureId: String
    }

    type Query {
        getTemplate(templateName: TemplateName): Template
    }

    type Mutation {
        createDocumentsFileLinks(
            numberOfLinks: Int! @constraint(min:1, max: 10)
        ): [FileLink]

        createAvatarFileLink: FileLink

        signDocumentFromTemplate(
            templateId: TemplateName!,
            fields: [GenericFieldInput]!
            signature: String!
        ): SignatureId
    }
`;

export const DocumentTypes = {
    typeDefs: schema,
    resolvers: {
        Query: {
            getTemplate: async (parent: any,
                                {templateName}: { templateName: string },
                                {modules}: SessionContext
            ) => {
                const api = modules.getApi<Documents.ApiType>(Documents);
                return api.getTemplate(templateName);
            },
        },
        Mutation: {
            createDocumentsFileLinks: async (parent: any,
                                             {numberOfLinks}: { numberOfLinks: number },
                                             {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Documents.ApiType>(Documents);
                return api.createDocumentsFileLinks(numberOfLinks, profileId);
            },
            signDocumentFromTemplate: async (parent: any,
                                             {
                                                 templateId,
                                                 fields,
                                                 signature
                                             }: { templateId: string, fields: any, signature: string },
                                             {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Documents.ApiType>(Documents);
                return api.signDocumentFromTemplate(templateId, fields, "8.8.8.8", (new Date()).getTime(), "my name", profileId);
            },
            createAvatarFileLink: async (parent: any,
                                         args: any,
                                         {profileId, modules}: SessionContext
            ) => {
                const api = modules.getApi<Documents.ApiType>(Documents);
                return api.createAvatarFileLink(profileId);
            },
        },
    }
}

