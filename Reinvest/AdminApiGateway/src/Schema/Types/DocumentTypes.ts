import { AdminSessionContext, JsonGraphQLError } from 'AdminApiGateway/index';
import { SessionContext } from 'ApiGateway/index';
import { Documents } from 'Documents/index';
import { Portfolio } from 'Reinvest/Portfolio/src';

const schema = `
    #graphql
    type Query {
        "Returns document link by id"
        getUserDocument(profileId: ID!, documentId: ID!): GetDocumentLink

        "[MOCK] Returns admin document link by id "
        getAdminDocument(documentId: ID!): GetDocumentLink
    }

    type Mutation {
        """
        Create file links for documents.
        In the response, it returns the "id" and "url".
        Use "url" for PUT request to upload the file directly to AWS S3. The url has expiration date!
        Use "id" wherever system needs the reference to uploaded file.
        """
        createImageFileLinks(
            numberOfLinks: Int! @constraint(min:1, max: 10)
        ): [PutFileLink]
    }
`;

export const DocumentTypes = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getUserDocument: async (
        parent: any,
        {
          profileId: userProfileId,
          documentId,
        }: {
          documentId: string;
          profileId: string;
        },
        { modules }: SessionContext,
      ) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return api.getDocumentLink(documentId, userProfileId);
      },
      getAdminDocument: async (
        parent: any,
        {
          documentId,
        }: {
          documentId: string;
        },
        { modules }: SessionContext,
      ) => {
        const api = modules.getApi<Documents.ApiType>(Documents);

        return null;
        // return api.getAdminDocumentLink(documentId);
      },
    },
    Mutation: {
      createImageFileLinks: async (parent: any, { numberOfLinks }: { numberOfLinks: number }, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new JsonGraphQLError('Access denied');
        }

        const api = modules.getApi<Documents.ApiType>(Documents);

        const portfolioApi = modules.getApi<Portfolio.ApiType>(Portfolio);

        const { portfolioId } = await portfolioApi.getActivePortfolio();

        return api.createImageFileLinks(numberOfLinks, portfolioId);
      },
    },
  },
};
