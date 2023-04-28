import { SessionContext } from 'ApiGateway/index';
import { Documents } from 'Documents/index';

const schema = `
    #graphql
    "Avatar link id input"
    input DocumentFileLinkInput {
        "This is @PutFileLink.id"
        id: String!
        "File name should be in format: .pdf, .jpeg, .jpg, .png"
        fileName: FileName!
    }

    "Avatar link id input"
    input AvatarFileLinkInput {
        "This is @PutFileLink.id"
        id: String!
    }

    "Link id"
    type DocumentFileLinkId {
        id: String
        fileName: String
    }

    "Link id + url to read the avatar"
    type GetAvatarLink {
        id: String
        url: String
        initials: String
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
        """
        [WIP]
        """
        getTemplate(templateName: TemplateName): Template

        "Returns document link by id"
        getDocument(documentId: String!): GetDocumentLink
    }

    type Mutation {
        """
        Create file links for documents.
        In the response, it returns the "id" and "url".
        Use "url" for PUT request to upload the file directly to AWS S3. The url has expiration date!
        Use "id" wherever system needs the reference to uploaded file.
        """
        createDocumentsFileLinks(
            numberOfLinks: Int! @constraint(min:1, max: 10)
        ): [PutFileLink]

        """
        Create file links for avatar.
        In the response, it returns the "id" and "url".
        Use "url" for PUT request to upload the avatar directly to AWS S3. The url has expiration date!
        Use "id" wherever system needs the reference to the avatar file.
        """
        createAvatarFileLink: PutFileLink

        """
        [WIP]
        """
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
      getTemplate: async (parent: any, { templateName }: { templateName: string }, { modules }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.getTemplate(templateName);
      },
      getDocument: async (parent: any, { documentId }: { documentId: string }, { modules, profileId }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.getDocumentLink(documentId, profileId);
      },
    },
    Mutation: {
      createDocumentsFileLinks: async (parent: any, { numberOfLinks }: { numberOfLinks: number }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.createDocumentsFileLinks(numberOfLinks, profileId);
      },
      signDocumentFromTemplate: async (
        parent: any,
        { templateId, fields, signature }: { fields: any; signature: string; templateId: string },
        { profileId, modules }: SessionContext,
      ) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.signDocumentFromTemplate(templateId, fields, '8.8.8.8', new Date().getTime(), 'my name', profileId);
      },
      createAvatarFileLink: async (parent: any, args: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.createAvatarFileLink(profileId);
      },
    },
  },
};
