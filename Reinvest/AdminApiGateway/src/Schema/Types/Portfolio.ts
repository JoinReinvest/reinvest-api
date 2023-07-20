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
        portfolioAuthorId: ID!
    }
    
    input PortfolioAuthorInput {
        avatar: FileLink
        name: String!
    }
    
    
    type PortfolioAuthor {
        avatar: GetDocumentLink
        name: String
        id: ID!
    }

    type PortfolioUpdate {
        image: GetDocumentLink
        title: String
        body: String
        createdAt: ISODateTime
        author: PortfolioAuthor
        id: ID!
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
        
        """
        [MOCK] returns all portfolio authors
        """
        getAllPortfolioAuthors: [PortfolioAuthor]
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
        Create portfolio update.
        As image id please use id from createImageFileLinks mutation
        """
        addPortfolioUpdate(input: PortfolioUpdateInput!): Boolean
        
        """
        Create portfolio author.
        As avatar id please use id from createAvatarFileLinks mutation
        """
        addPortfolioAuthor(input: PortfolioAuthorInput!): Boolean
        
        """
        Remove portfolio update from database
        """
        deletePortfolioUpdate(portfolioUpdateId: ID!): Boolean
        
        """
        Remove author from database
        """
        deletePortfolioAuthor(portfolioAuthorId: ID!): Boolean
    }
`;

type UpdatePropertyDetailsInput = {
  input: UpdatePropertyInput;
  portfolioId: string;
  propertyId: number;
};

type AddPortfolioUpdateInput = {
  input: {
    body: string;
    createdAt: Date;
    image: { id: string };
    title: string;
    portfolioAuthorId: string;
  };
};

type AddPortfolioAuthorInput = {
  input: {
    avatar: { id: string };
    name: string;
  };
};

type DeletePortfolioUpdateInput = {
  portfolioUpdateId: string;
};

type DeletePortfolioAuthorInput = {
  portfolioAuthorId: string;
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
        return api.getAllPortfolioUpdates();
      },
      getAllPortfolioAuthors: async (parent: any, { data }: any, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);

        return await api.getAllPortfolioAuthors();
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
      addPortfolioUpdate: async (parent: any, { input }: AddPortfolioUpdateInput, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const errors = await api.addPortfolioUpdate({ ...input });

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return true;
      },
      addPortfolioAuthor: async (parent: any, { input }: AddPortfolioAuthorInput, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }
        console.log('input', input);
        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const errors = await api.addPortfolioAuthor({ ...input });

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return true;
      },
      deletePortfolioAuthor: async (parent: any, { portfolioAuthorId }: DeletePortfolioAuthorInput, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const errors = await api.deletePortfolioAuthor(portfolioAuthorId);

        if (errors.length > 0) {
          throw new JsonGraphQLError(errors);
        }

        return true;
      },
      deletePortfolioUpdate: async (parent: any, { portfolioUpdateId }: DeletePortfolioUpdateInput, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Portfolio.ApiType>(Portfolio);
        const errors = await api.deletePortfolioUpdate(portfolioUpdateId);

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
