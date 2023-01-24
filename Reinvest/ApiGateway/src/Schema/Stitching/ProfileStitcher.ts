import {delegateToSchema} from '@graphql-tools/delegate';
import {stitchSchemas} from "@graphql-tools/stitch";
import {GraphQLSchema, OperationTypeNode} from "graphql";
import {SessionContext} from "ApiGateway/index";

const extendedProfile = `
    #graphql
    extend type Profile {
        details: Individual
        completionStatus: ProfileCompletionStatus
    }
`;

export const ProfileStitcher = (rootSchema: GraphQLSchema) => stitchSchemas({
    subschemas: [rootSchema],
    typeDefs: extendedProfile,
    resolvers: {
        Profile: {
            details: {
                selectionSet: `{id}`,
                resolve(parent: any, args: any, context: SessionContext, info: any) {
                    return delegateToSchema({
                        schema: rootSchema,
                        operation: OperationTypeNode.QUERY,
                        fieldName: 'getIndividual',
                        args,
                        context,
                        info
                    })
                }
            },
            completionStatus: {
                resolve(parent: any, args: any, context: SessionContext, info: any) {
                    return delegateToSchema({
                        schema: rootSchema,
                        operation: OperationTypeNode.QUERY,
                        fieldName: 'profileCompletionStatus',
                        args,
                        context,
                        info
                    })
                }
            },
        }
    }
})


