import { SessionContext } from 'ApiGateway/index';
import { Portfolio } from 'Portfolio/index';
import { AdminSessionContext } from 'AdminApiGateway/index';

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
    
    type PortfolioAuthor {
        avatar: GetAvatarLink
        name: String!
        id: ID!
    }
    
    type PortfolioUpdate {
        image: GetDocumentLink
        title: String!
        body: String
        createdAt: ISODateTime!
        author: PortfolioAuthor
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

    type Nav {
        unitPrice: USD
    }

    type PortfolioDetails {
        id: String
        name: String
        properties: [Property]
        currentNav: Nav
    }

    type Query {
        """
        Returns all information about properties in the portfolio
        """
        getPortfolioDetails: PortfolioDetails
        
        """
        Returns all portfolio updates
        """
        getAllPortfolioUpdates: [PortfolioUpdate]
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
      getAllPortfolioUpdates: async (parent: any, { data }: any, { modules, isAdmin }: AdminSessionContext) => {
        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        return await api.getAllPortfolioUpdates();
      },
    },
  },
};
