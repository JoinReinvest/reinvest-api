import express, {Express, Request, Response} from 'express';

export const app: Express = express();

app.get('/', (req: Request, res: Response) => {
    // const requestContext = req.event.requestContext;
    console.log(req.event.requestContext.authorizer.jwt.claims);
    res.send('[GET] Function test - worked');
});

app.post('/', (req: Request, res: Response) => {
    res.send('[POST] Function test - worked');
});