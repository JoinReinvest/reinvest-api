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

    input KeyMetricsInput {
        projectReturn: String
        structure: String
        rating: String
    }

    type ImpactMetrics {
        units: String
        totalProjectSize: String
        jobsCreated: String
    }

    input ImpactMetricsInput {
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

    input POIInput {
        name: String
        description: String
        image: String
    }

    type PropertyAddress {
        addressLine: String
        city: String
        zip: String
    }

    input FileLink {
        id: String
    }

    type Property {
        id: Int
        name: String
        keyMetrics: KeyMetrics
        impactMetrics: ImpactMetrics
        address: PropertyAddress
        image: String
        gallery: [String]
        POIs: [POI]
        location: Location
    }

    input PropertyInput {
        keyMetrics: KeyMetricsInput
        impactMetrics: ImpactMetricsInput
        image: FileLink
        gallery: [FileLink]
        POIs: [POIInput]
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

        updateProperty(input: PropertyInput!, propertyId: Int): Boolean

        synchronizePortfolio: Boolean
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
      getPortfolioDetails: async (parent: any, { data }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        const { portfolioId } = await api.getActivePortfolio();

        return api.getPortfolioDetails(portfolioId);
      },
    },
    Mutation: {
      synchronizePortfolio: async (parent: any, { data }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        const { portfolioId } = await api.getActivePortfolio();
        const status = await api.synchronizePortfolio(portfolioId);

        return status;
      },
      updateProperty: async (parent: any, { input, propertyId }: UpdatePropertyDetailsInput, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        const { portfolioId } = await api.getActivePortfolio();
        const errors = await api.updateProperty(input, propertyId, portfolioId);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return true;
      },
    },
  },
};
