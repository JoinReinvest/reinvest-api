import Container, {ContainerInterface} from "Container/Container";

import {Api, EventHandler, Module} from "Reinvest/Modules";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {identityApi, IdentityApiType} from "Identity/Port/Api/IdentityApi";
import {PortsProvider} from "Identity/Providers/PortsProvider";
import {AdapterServiceProvider} from "Identity/Providers/AdapterServiceProvider";
import {identityTechnicalHandler, IdentityTechnicalHandlerType} from "Identity/Port/Events/IdentityTechnicalHandler";
import {InvestmentAccounts} from "InvestmentAccounts/index";
import {ServicesProvider} from "Identity/Providers/ServicesProvider";
import * as IdentityMigrations from "../migrations";

export namespace Identity {
    export const moduleName = "Identity";
    export type Config = {
        database: PostgreSQLConfig;
    };

    export type ModulesDependencies = {
        investmentAccounts: InvestmentAccounts.Main
    }

    export type ApiType = IdentityApiType & Api
    export type TechnicalHandlerType = IdentityTechnicalHandlerType & EventHandler;

    export class Main implements Module {
        private readonly config: Identity.Config;
        private readonly container: ContainerInterface;
        private booted = false;
        private modules: Identity.ModulesDependencies;

        constructor(config: Identity.Config, modules: ModulesDependencies) {
            this.config = config;
            this.modules = modules;
            this.container = new Container();
        }

        private boot(): void {
            if (this.booted) {
                return;
            }

            this.container.addAsValue('InvestmentAccounts', this.modules.investmentAccounts);
            new AdapterServiceProvider(this.config).boot(this.container);
            new ServicesProvider(this.config).boot(this.container);
            new PortsProvider(this.config).boot(this.container);

            this.booted = true;
        }

        // public module API
        api(): ApiType {
            this.boot();
            return identityApi(this.container);
        }

        isHandleEvent(kind: string): boolean {
            return kind in identityTechnicalHandler(new Container());
        }

        technicalEventHandler(): TechnicalHandlerType {
            this.boot();
            return identityTechnicalHandler(this.container);
        }

        migration() {
            return IdentityMigrations;
        }
    }

    export function create(config: Identity.Config, modules: Identity.ModulesDependencies) {
        return new Identity.Main(config, modules);
    }
}
