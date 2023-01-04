import serverless from 'serverless-http';

import {app} from 'Reinvest/ApiGateway';
import {boot} from "Reinvest/bootstrap";


const modules = boot();

// export const main = serverless(app, {
//     request: function (req, event, context) {
//         // context.callbackWaitsForEmptyEventLoop = false;
//         req.event = event;
//         req.context = context;
//     },
// });

export const main = app(modules);