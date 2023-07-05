import { SessionContext } from 'ApiGateway/index';
import { Documents } from 'Documents/index';
import { UUID } from 'HKEKTypes/Generics';

const schema = `
    #graphql
    "Avatar link id input"
    input DocumentFileLinkInput {
        "This 'id' comes usually from @PutFileLink.id"
        id: ID!
        "File name should be in format: .pdf, .jpeg, .jpg, .png"
        fileName: FileName!
    }

    "Avatar link id input"
    input AvatarFileLinkInput {
        "This is @PutFileLink.id"
        id: ID!
    }

    "Link id"
    type DocumentFileLinkId {
        id: ID
        fileName: String
    }

    "Link id + url to read the avatar"
    type GetAvatarLink {
        id: ID
        url: String
        initials: String
    }

    "Link id + url to read the document"
    type GetDocumentLink {
        id: ID
        url: String
    }

    "Link id + PUT url to store resource in the storage"
    type PutFileLink {
        id: ID
        url: String
    }

    type RenderedPage {
        id: ID
        """source url"""
        url: String
        name: String
        dateCreated: String
        dateGenerated: String
    }

    type Query {
        "Returns document link by id"
        getDocument(documentId: ID!): GetDocumentLink

        listRenderedPages(pagination: Pagination = {page: 0, perPage: 10}): [RenderedPage]

        getRenderedPageLink(id: ID!): GetDocumentLink
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

        renderPageToPdf(link: String, name: String): ID
    }
`;

export const DocumentTypes = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getDocument: async (parent: any, { documentId }: { documentId: string }, { modules, profileId }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.getDocumentLink(documentId, profileId);
      },
      listRenderedPages: async (parent: any, { pagination }: any, { modules, profileId }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.listRenderedPages(profileId, pagination);
      },
      getRenderedPageLink: async (parent: any, { id }: { id: UUID }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.getRenderedPageLink(profileId, id);
      },
    },
    Mutation: {
      createDocumentsFileLinks: async (parent: any, { numberOfLinks }: { numberOfLinks: number }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.createDocumentsFileLinks(numberOfLinks, profileId);
      },
      createAvatarFileLink: async (parent: any, args: any, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.createAvatarFileLink(profileId);
      },
      renderPageToPdf: async (parent: any, { link, name }: { link: string; name: string }, { profileId, modules }: SessionContext) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.renderPageToPdf(profileId, name, link);
      },
    },
  },
};
