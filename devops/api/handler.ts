import serverless from 'serverless-http';

import {app} from '../../Reinvest/ApiGateway';



export const main = serverless(app, {
    request: function (req, event, context) {
        // context.callbackWaitsForEmptyEventLoop = false;
        req.event = event;
        req.context = context;
    },
});
