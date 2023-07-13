import { AdminSessionContext } from 'AdminApiGateway/index';
import { GraphQLError } from 'graphql';
import { Verification } from 'Verification/index';

const schema = `
    #graphql
    type Query {
        hello: String
    }

    type Mutation {
        """
        @access: Admin, Executive
        Recover verification of an object after failed request manually
        """
        recoverVerification(objectId: ID!): Boolean
    }
`;

export const AdminVerificationSchema = {
  typeDefs: schema,
  resolvers: {
    Query: {
      hello: () => 'Hello!',
    },
    Mutation: {
      recoverVerification: async (parent: any, { objectId }: { objectId: string }, { modules, isAdmin }: AdminSessionContext) => {
        if (!isAdmin) {
          throw new GraphQLError('Access denied');
        }

        const api = modules.getApi<Verification.ApiType>(Verification);

        return api.recoverVerification(objectId);
      },
    },
  },
};
