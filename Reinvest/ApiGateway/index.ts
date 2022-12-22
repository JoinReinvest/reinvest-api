
import express, {Express, Request, Response} from 'express';
import axios, {AxiosResponse} from "axios";
import pg from 'pg';

import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {S3Client, GetObjectCommand, PutObjectCommand, PutObjectCommandInput} from "@aws-sdk/client-s3";

import {ApolloServer} from '@apollo/server';
import {startServerAndCreateLambdaHandler} from '@as-integrations/aws-lambda';
import {boot} from "../bootstrap";
import Schema from './Schema';


const server = new ApolloServer({
    schema: Schema,
    includeStacktraceInErrorResponses: false,
    formatError: ((err) => {
        console.error(err)
        return err
    })
});


export const app = startServerAndCreateLambdaHandler(server, {
    context: async ({event, context}) => {
        boot();
        // throw new GraphQLError('User is not authenticated', {
        //     extensions: {
        //         code: 'UNAUTHENTICATED',
        //         http: { status: 401 },
        //     },
        // });

        return {
            lambdaEvent: event,
            lambdaContext: context,
        };

    },
});
// export const app: Express = express();
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
