import {delegateToSchema} from '@graphql-tools/delegate';
import {stitchSchemas} from "@graphql-tools/stitch";
import {GraphQLSchema, OperationTypeNode} from "graphql";
import {SessionContext} from "ApiGateway/index";

const extendedProfile = `
    #graphql
    extend type Profile {
        accounts: [AccountOverview]
    }
`;

export const ProfileStitcher = (rootSchema: GraphQLSchema) => stitchSchemas({
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
                        info
                    })
                }
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
        }
    }
})


