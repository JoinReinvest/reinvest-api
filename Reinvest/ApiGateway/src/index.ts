import {ApolloServer} from "@apollo/server";
import {startServerAndCreateLambdaHandler} from "@as-integrations/aws-lambda";
import {
    GetObjectCommand,
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client,
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import axios, {AxiosResponse} from "axios";
import express, {Express, Request, Response} from "express";
import Modules from "Reinvest/Modules";

import Schema from "ApiGateway/Schema";
import {GraphQLError} from "graphql";
import {Identity} from "Reinvest/Identity/src";
import IdentityApi = Identity.IdentityApi;

const server = new ApolloServer({
    schema: Schema,
    includeStacktraceInErrorResponses: true, // todo this should be debug flag
    formatError: (err) => {
        console.error(err);

        return err;
    },
});

export type SessionContext = { modules: Modules, profileId: string }

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

                const api = modules.getApi<IdentityApi>(Identity);
                const profileId = api.getProfile(userId);

                return <SessionContext>{
                    profileId,
                    modules,
                };
            } catch (error: any) {
                console.log(error);
            }
        },
    });
};
// export const app: Express = express();.aut
//
//
// app.get('/', async (req: Request, res: Response) => {
//     // const requestContext = req.event.requestContext;
//     // console.log(req.event.requestContext.authorizer.jwt.claims);
//     const response: AxiosResponse = await axios
//         .get('https://httpbin.org/get');
//     // throw new Error('testY');
//
//     // const client = new pg.Client({
//     //     host: 'lukaszd-staging-postgresql.c1eerecii0f7.eu-west-2.rds.amazonaws.com',
//     //     // host: 'localhost',
//     //     port: 5432,
//     //     user: 'executive',
//     //     password: 'password',
//     //     database: 'lukaszd_staging_db',
//     //     connectionTimeoutMillis: 2000,
//     //     query_timeout: 2000,
//     // })
//
//     // await client.connect();
//     // await client.query("insert into users (username) values ('lukas')");
//     // const result = await client.query('SELECT * from users');
//
//     //

// });
