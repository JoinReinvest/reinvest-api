import express, {Express, Request, Response} from 'express';

export const app: Express = express();

app.get('/', (req: Request, res: Response) => {
    res.send('[GET] Function test - worked');
});

app.post('/', (req: Request, res: Response) => {
    res.send('[POST] Function test - worked');
});