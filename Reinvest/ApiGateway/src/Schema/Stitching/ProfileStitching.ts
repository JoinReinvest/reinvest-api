import {delegateToSchema} from '@graphql-tools/delegate';
import {stitchSchemas} from "@graphql-tools/stitch";
import {GraphQLSchema, OperationTypeNode} from "graphql";

const extendedProfile = `
    #graphql
    extend type Profile {
        details: Individual
    }
`;

export const stitchWithProfile = (rootSchema: GraphQLSchema) => stitchSchemas({
    subschemas: [rootSchema],
    typeDefs: extendedProfile,
    resolvers: {
        Profile: {
            details: {
                selectionSet: `{ id }`,
                resolve(parent: any, args: any, context: any, info: any) {
                    const profileId: string = parent.id
                    return delegateToSchema({
                        schema: rootSchema,
                        operation: OperationTypeNode.QUERY,
                        fieldName: 'getIndividual',
                        args: {profileId},
                        context,
                        info
                    })
                }
            }
        }
    }
})


