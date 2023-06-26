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

export type SessionContext = {
  clientIp: string;
  isBannedAccount: (accountId: string) => boolean;
  modules: Modules;
  profileId: string;
  throwIfBanned: (accountId: string) => void | never;
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

      const clientIp = event?.headers?.['X-Forwarded-For'] ?? '127.0.0.1';
      const userId = authorizer.jwt.claims.sub;
      const api = modules.getApi<Identity.ApiType>(Identity);
      const userProfile = await api.getProfile(userId);

      if (userProfile === null) {
        throw new GraphQLError('Profile not exist');
      }

      if (userProfile.isBannedProfile()) {
        throw new GraphQLError('Profile is banned');
      }

      return <SessionContext>{
        clientIp,
        userId,
        profileId: userProfile.profileId,
        modules,
        isBannedAccount: userProfile.isBannedAccount,
        throwIfBanned: (accountId: string) => {
          if (userProfile.isBannedAccount(accountId)) {
            throw new GraphQLError('Account is banned');
          }
        },
      };
    },
  });
};
