import {ApolloServer} from "@apollo/server";
import {startServerAndCreateLambdaHandler} from "@as-integrations/aws-lambda";
import Modules from "Reinvest/Modules";
import Schema from "ApiGateway/Schema";
import {GraphQLError} from "graphql";
import {Identity} from "Reinvest/Identity/src";

const server = new ApolloServer({
    schema: Schema,
    includeStacktraceInErrorResponses: true, // todo this should be debug flag
    formatError: (err) => {
        console.log(err);

        return err;
    },
});

export type SessionContext = { modules: Modules, profileId: string, userId: string }

export const app = (modules: Modules) => {
    return startServerAndCreateLambdaHandler(server, {
        // @ts-ignore
        context: async ({event, context}) => {
            try {
                // @ts-ignore
                const {authorizer} = event.requestContext;
                if (!authorizer || !authorizer.jwt.claims.sub) {
                    throw new GraphQLError('User is not authenticated', {
                        extensions: {
                            code: 'UNAUTHENTICATED',
                            http: {status: 401},
                        },
                    });
                }
                const userId = authorizer.jwt.claims.sub;

                const api = modules.getApi<Identity.ApiType>(Identity);
                const profileId = api.getProfileId(userId);

                return <SessionContext>{
                    userId,
                    profileId,
                    modules,
                };
            } catch (error: any) {
                console.log(error);
            }
        },
    });
};