import serverless from "serverless-http";
import {boot} from "Reinvest/bootstrap";
import {IdentityApiType} from "Reinvest/Identity/src/Port/Api/IdentityApi";
import {Identity} from "Reinvest/Identity/src";

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.post('/incentive-token', async function (req: any, res: any) {
    const modules = boot();
    const {token} = req.body;
    console.log({token, body: req.body});
    if (!token) {
        console.warn(`No token provided`);
        res.json({status: false});
        return;
    }
    const identityModule = modules.getApi<IdentityApiType>(Identity);
    const status = await identityModule.isIncentiveTokenValid(token);
    await modules.close();
    res.json({status});
})

export const main = serverless(app);
