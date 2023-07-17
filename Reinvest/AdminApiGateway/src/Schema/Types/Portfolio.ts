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
        projectReturn: String!
        structure: String!
        rating: String!
    }

    type ImpactMetrics {
        units: String
        totalProjectSize: String
        jobsCreated: String
    }

    input ImpactMetricsInput {
        units: String!
        totalProjectSize: String!
        jobsCreated: String!
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
        name: String!
        description: String!
        image: FileLink!
    }

    type PropertyAddress {
        addressLine: String
        city: String
        zip: String
    }

    input FileLink {
        id: String!
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
    
    input PortfolioUpdateInput {
        image: FileLink
        title: String!
        body: String
        createdAt: ISODateTime!
    }
    
    type PortfolioUpdate {
        image: GetDocumentLink
        title: String!
        body: String
        createdAt: ISODateTime!
    }

    input PropertyInput {
        keyMetrics: KeyMetricsInput
        impactMetrics: ImpactMetricsInput
        image: FileLink
        gallery: [FileLink]
        POIs: [POIInput]
    }

    type Nav {
        dateSynchronization: ISODateTime
        unitPrice: USD
        numberOfShares: Float
    }

    type PortfolioDetails {
        id: ID
        name: String
        northCapitalOfferingId: String
        offeringName: String
        vertaloAllocationId: String
        assetName: String
        linkToOfferingCircular: String
        properties: [Property]
        currentNav: Nav
        navHistory: [Nav]
    }

    type Query {
        """
        [MOCK] returns all information about properties in the portfolio
        """
        getPortfolioDetails: PortfolioDetails
        
        """
        [MOCK] returns all portfolio updates
        """
        getAllPortfolioUpdates: [PortfolioUpdate]
    }

    type Mutation {

        updateProperty(input: PropertyInput!, propertyId: Int): Boolean

        synchronizePortfolioPropertiesFromDealpath: Boolean

        """
        [MVP] Currently we can have only one portfolio in the system. This mutation will create a new portfolio and set it as active and disallow to create another one.
        """
        registerPortfolio(name: String!, northCapitalOfferingId: String!, vertaloAllocationId: String!, linkToOfferingCircular: String!): PortfolioDetails

        synchronizePortfolioNav: Nav
        
        """
        [MOCK]
        """
        addPortfolioUpdate(input: PortfolioUpdateInput!): Boolean
        
        """
        [MOCK]
        """
        deletePortfolioUpdate(portfolioId: ID!): Boolean
    }
`;

type UpdatePropertyDetailsInput = {
  input: UpdatePropertyInput;
  portfolioId: string;
  propertyId: number;
};

type AddPortfolioUpdateInput = {
  image: { id: string };
  title: string;
  body: string;
  createdAt: Date;
};

type DeletePortfolioUpdateInput = {
  portfolioId: string;
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
      getAllPortfolioUpdates: async (parent: any, { data }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        const test = await api.getAllPortfolioUpdates();

        return test;
      },
    },
    Mutation: {
      synchronizePortfolioPropertiesFromDealpath: async (parent: any, { data }: any, { modules, isAdmin }: AdminSessionContext) => {
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
      addPortfolioUpdate: async (parent: any, input: AddPortfolioUpdateInput, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const errors = await api.addPortfolioUpdate(input);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return true;
      },
      deletePortfolioUpdate: async (parent: any, { portfolioId }: DeletePortfolioUpdateInput, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const errors = await api.deletePortfolioUpdate(portfolioId);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return true;
      },
      registerPortfolio: async (
        parent: any,
        { name, northCapitalOfferingId, vertaloAllocationId, linkToOfferingCircular }: any,
        { modules, isAdmin }: AdminSessionContext,
      ) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const result = await api.registerPortfolio(name, northCapitalOfferingId, vertaloAllocationId, linkToOfferingCircular);

        if (result.errors.length > 0) {
          throw new JsonGraphQLError(result.errors);
        }

        return api.getPortfolioDetails(result.portfolioId!);
      },
      synchronizePortfolioNav: async (parent: any, data: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        const { portfolioId } = await api.getActivePortfolio();
        await api.synchronizeNav(portfolioId);

        return api.getCurrentNav(portfolioId);
      },
    },
  },
};
