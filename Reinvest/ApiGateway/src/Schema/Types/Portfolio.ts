import { SessionContext } from 'ApiGateway/index';
import { Portfolio } from 'Portfolio/index';

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
`;

export const PortfolioSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      getPortfolioDetails: async (parent: any, data: any, { modules }: SessionContext) => {
        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const activePortfolio = await api.getActivePortfolio(); // For the future - id of portfolio should come from the request

        return api.getPortfolioDetails(activePortfolio.portfolioId);
      },
    },
  },
};
