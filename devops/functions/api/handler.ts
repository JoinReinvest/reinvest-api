import { wrapWithLogger } from 'Logger/lambdaWrapper';
import { app } from 'Reinvest/ApiGateway/src';
import { boot } from 'Reinvest/bootstrap';
import { SENTRY_CONFIG } from 'Reinvest/config';

const modules = boot();
// export const main = wrapWithLogger(SENTRY_CONFIG, app(modules));
export const main = app(modules);
