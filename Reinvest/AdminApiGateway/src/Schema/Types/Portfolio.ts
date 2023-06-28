import { AdminSessionContext, JsonGraphQLError } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';
import { Portfolio } from 'Portfolio/index';
import { UpdatePropertyInput } from 'Reinvest/Portfolio/src/UseCase/UpdateProperty';

const schema = `
    #graphql
    type KeyMetrics {
        projectReturn: String
        structure: String
        rating: String
    }

    type ImpactMetrics {
        units: String
        totalProjectSize: String
        jobsCreated: String
    }

    type Location {
        lat: String
        lng: String
    }

    type POI {
        name: String
        description: String
        image: String
    }

    type PropertyAddress {
        addressLine: String
        city: String
        zip: String
    }

    type Property {
        name: String
        keyMetrics: KeyMetrics
        impactMetrics: ImpactMetrics
        address: PropertyAddress
        image: String
        gallery: [String]
        POIs: [POI]
        location: Location
    }

    type PortfolioDetails {
        id: String
        name: String
        properties: [Property]
    }


    type Query {
        """
        [MOCK] returns all information about properties in the portfolio
        """
        getPortfolioDetails: PortfolioDetails
    }
    type Mutation {
      """
      updateProperty(input: Property, portfolioId: ID!, propertyId: number): Property
    }
`;

type UpdatePropertyDetailsInput = {
  input: UpdatePropertyInput;
  portfolioId: string;
  propertyId: number;
};

export const PortfolioSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getProperty: async (parent: any, { portfolioId, propertyId }: any, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        return api.getProperty(propertyId, portfolioId);
      },
    },
    Mutation: {
      updateProperty: async (parent: any, { input, portfolioId, propertyId }: UpdatePropertyDetailsInput, { modules, isExecutive }: AdminSessionContext) => {
        if (!isExecutive) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        const errors = await api.updateProperty(input, propertyId, portfolioId);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return api.getProperty(propertyId, portfolioId);
      },
    },
  },
};
