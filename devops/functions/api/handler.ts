import {app} from "Reinvest/ApiGateway/src";
import {boot} from "Reinvest/bootstrap";

const modules = boot();
export const main = app(modules);
