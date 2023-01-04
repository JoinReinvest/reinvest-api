import { app } from "Reinvest/ApiGateway";
import { boot } from "Reinvest/bootstrap";
import serverless from "serverless-http";

const modules = boot();

// export const main = serverless(app, {
//     request: function (req, event, context) {
//         // context.callbackWaitsForEmptyEventLoop = false;
//         req.event = event;
//         req.context = context;
//     },
// });

export const main = app(modules);
