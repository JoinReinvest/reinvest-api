import {SessionContext} from "ApiGateway/index";
import {Documents} from "Documents/index";

const schema = `
    #graphql
    "Link id input"
    input FileLinkInput {
        "This is @PutFileLink.id"
        id: String!
    }

    "Link id"
    type FileLinkId {
        id: String
    }

    "Link id + url to read the avatar"
    type GetAvatarLink {
        id: String
        url: String
    }

    "Link id + url to read the document"
    type GetDocumentLink {
        id: String
        url: String
    }

    "Link id + PUT url to store resource in the storage"
    type PutFileLink {
        id: String
        url: String
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
        ): [PutFileLink]

        createAvatarFileLink: PutFileLink

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

