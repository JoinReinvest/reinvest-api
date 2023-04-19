import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda';
import Schema from 'ApiGateway/Schema';
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

export type SessionContext = { modules: Modules; profileId: string; userId: string };

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

      const userId = authorizer.jwt.claims.sub;
      const api = modules.getApi<Identity.ApiType>(Identity);
      const profileId = await api.getProfileId(userId);

      if (profileId === null) {
        throw new GraphQLError('Profile not exist');
      }

      return <SessionContext>{
        userId,
        profileId,
        modules,
      };
    },
  });
};
