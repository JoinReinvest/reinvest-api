import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios, { AxiosResponse } from "axios";
import express, { Express, Request, Response } from "express";
import Modules from "Reinvest/Modules";

import Schema from "ApiGateway/Schema";
import {GraphQLError} from "graphql";

const server = new ApolloServer({
  schema: Schema,
  includeStacktraceInErrorResponses: true, // todo this should be debug flag
  formatError: (err) => {
    console.error(err);

    return err;
  },
});

export const app = (modules: Modules) => {
  return startServerAndCreateLambdaHandler(server, {
    // @ts-ignore
    context: async ({event, context}) => {
      try {

        if (!event.requestContext.authorizer.jwt.claims.sub) {
          throw new GraphQLError('User is not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
              http: {status: 401},
            },
          });
        }

        return {
          userId: event.requestContext.authorizer.jwt.claims.sub,
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
//     const client = new S3Client({
//         region: 'eu-west-2'
//     });
//     // const getCommand = new GetObjectCommand({
//     //     Bucket: 'lukaszd-staging-avatars',
//     //     Key: 'tomasz.jpeg'
//     // });
//     // const getUrl = await getSignedUrl(client, getCommand, {expiresIn: 3600});
//
//     const putInput: PutObjectCommandInput = {
//         Bucket: 'lukaszd-staging-portfolio',
//         Key: 'property.jpeg',
//         // ResponseContentType: 'image/jpeg',
//         ACL: 'public-read'
//     };
//     const putCommand = new PutObjectCommand(putInput);
//     const getPutCommand = new GetObjectCommand(putInput);
//
//     const putUrl = await getSignedUrl(client, putCommand, {expiresIn: 3600});
//     // const getPutUrl = await getSignedUrl(client, getPutCommand, {expiresIn: 3600});
//     const url =
//         res.send({
//             // db: result.rows,
//             http: response.data,
//             // url: getUrl,
//             putUrl,
//             // getPutUrl,
//             // url,
//             claims: req.event.requestContext.authorizer.jwt.claims,
//         });
// });
