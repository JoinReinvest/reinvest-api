import { app } from 'Reinvest/AdminApiGateway/src';
import { boot } from 'Reinvest/bootstrap';

const modules = boot();
export const main = app(modules);
