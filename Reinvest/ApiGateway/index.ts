import express, {Express, Request, Response} from 'express';
import axios, {AxiosResponse} from "axios";
// import pg from 'pg'

export const app: Express = express();

app.get('/', async (req: Request, res: Response) => {
    // const requestContext = req.event.requestContext;
    // console.log(req.event.requestContext.authorizer.jwt.claims);
    const response: AxiosResponse = await axios
        .get('https://httpbin.org/get');
    // throw new Error('testY');

    // const client = new pg.Client({
    //     host: 'lukaszd-staging-postgresql.c1eerecii0f7.eu-west-2.rds.amazonaws.com',
    //     // host: 'localhost',
    //     port: 5432,
    //     user: 'executive',
    //     password: 'password',
    //     database: 'lukaszd_staging_db',
    //     connectionTimeoutMillis: 2000,
    //     query_timeout: 2000,
    // })

    // await client.connect();
    // await client.query("insert into users (username) values ('lukas')");
    // const result = await client.query('SELECT * from users');


    res.send({
        // db: result.rows,
        http: response.data,
        // claims: req.event.requestContext.authorizer.jwt.claims,
    });
});

app.post('/', (req: Request, res: Response) => {
    res.send('[POST] Function test - worked');
});