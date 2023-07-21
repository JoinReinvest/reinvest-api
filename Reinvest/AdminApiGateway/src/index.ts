import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';
import Schema from 'AdminApiGateway/Schema';
import { GraphQLError } from 'graphql';
import { Identity } from 'Reinvest/Identity/src';
import Modules from 'Reinvest/Modules';

export class JsonGraphQLError extends GraphQLError {
  constructor(json: any, extensions?: any) {
    super('Invalid query/mutation', undefined, undefined, undefined, undefined, undefined, {
      details: json,
      ...extensions,
    });
  }
}

const server = new ApolloServer({
  schema: Schema,

  // todo this should be debug flag
  includeStacktraceInErrorResponses: false,
  formatError: error => {
    console.warn(error);

    return error;
  },
});

export type AdminSessionContext = {
  isAdmin: boolean;
  isExecutive: boolean;
  modules: Modules;
  profileId: string;
  userId: string;
};

export const app = (modules: Modules) => {
  return startServerAndCreateLambdaHandler(server, {
    // @ts-ignore
    context: async ({ event, context }) => {
      // @ts-ignore
      const { authorizer } = event.requestContext;

      if (!authorizer || !authorizer.jwt.claims.sub) {
        throw new GraphQLError('User is not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }

      let isAdmin = false;
      let isExecutive = false;

      const groups = authorizer.jwt.claims['cognito:groups'] || [];

      if (groups.includes('Executives') === true) {
        isExecutive = true;
        isAdmin = true;
      } else if (groups.includes('Administrators') === true) {
        isAdmin = true;
      } else {
        throw new GraphQLError('Access denied', {
          extensions: {
            code: 'UNAUTHORIZED',
            http: { status: 403 },
          },
        });
      }

      const userId = authorizer.jwt.claims.sub;
      const api = modules.getApi<Identity.ApiType>(Identity);
      const profile = await api.getProfile(userId);

      if (profile === null) {
        throw new GraphQLError('Profile not exist');
      }

      return <AdminSessionContext>{
        userId,
        profileId: profile.profileId,
        modules,
        isExecutive,
        isAdmin,
      };
    },
  });
};
