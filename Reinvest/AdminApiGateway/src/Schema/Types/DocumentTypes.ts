import { AdminSessionContext, JsonGraphQLError } from 'AdminApiGateway/index';
import { Documents } from 'Documents/index';
import { Portfolio } from 'Reinvest/Portfolio/src';

const schema = `
    #graphql

    "Link id + PUT url to store resource in the storage"
    type PutFileLink {
        id: ID
        url: String
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
