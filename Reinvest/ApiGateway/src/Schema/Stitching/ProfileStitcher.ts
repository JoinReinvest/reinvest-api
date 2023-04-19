import { delegateToSchema } from '@graphql-tools/delegate';
import { stitchSchemas } from '@graphql-tools/stitch';
import { SessionContext } from 'ApiGateway/index';
import { GraphQLSchema, OperationTypeNode } from 'graphql';

const extendedProfile = `
    #graphql
    extend type Profile {
        accounts: [AccountOverview]
    }
`;

export const ProfileStitcher = (rootSchema: GraphQLSchema) =>
  stitchSchemas({
    subschemas: [rootSchema],
    typeDefs: extendedProfile,
    resolvers: {
      Profile: {
        accounts: {
          selectionSet: `{externalId}`,
          resolve(parent: any, args: any, context: SessionContext, info: any) {
            return delegateToSchema({
              schema: rootSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: 'getAccountsOverview',
              args,
              context,
              info,
            });
          },
        },
        // completionStatus: {
        //     resolve(parent: any, args: any, context: SessionContext, info: any) {
        //         return delegateToSchema({
        //             schema: rootSchema,
        //             operation: OperationTypeNode.QUERY,
        //             fieldName: 'profileCompletionStatus',
        //             args,
        //             context,
        //             info
        //         })
        //     }
        // },
      },
    },
  });
