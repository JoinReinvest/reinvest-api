import Container, {ContainerInterface} from "Container/Container";
import QueryProviders from "InvestmentAccounts/Providers/QueryProviders";
import ServiceProviders from "InvestmentAccounts/Providers/ServiceProviders";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import EventBusProvider from "InvestmentAccounts/Providers/EventBusProvider";
import {Api, EventHandler, Module} from "Reinvest/Modules";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {
    investmentAccountsApi,
    InvestmentAccountsApiType
} from "InvestmentAccounts/Infrastructure/Api/InvestmentAccountsApi";
import {
    investmentAccountsTechnicalHandler, InvestmentAccountsTechnicalHandlerType
} from "InvestmentAccounts/Infrastructure/Events/InvestmentAccountsTechnicalHandler";
import PortsProviders from "InvestmentAccounts/Providers/PortsProviders";

export namespace InvestmentAccounts {
    export const moduleName = "InvestmentAccounts";
    export type Config = {
        database: PostgreSQLConfig;
    };

    export type ApiType = InvestmentAccountsApiType & Api;
    export type TechnicalHandlerType = InvestmentAccountsTechnicalHandlerType & EventHandler;

    export class Main implements Module {
        private readonly config: InvestmentAccounts.Config;
        private readonly container: ContainerInterface;
        private booted = false;

        constructor(config: InvestmentAccounts.Config) {
            this.config = config;
            this.container = new Container();
        }

        private boot(): void {
            if (this.booted) {
                return;
            }
            new EventBusProvider(this.config).boot(this.container);
            new ServiceProviders(this.config).boot(this.container);
            new QueryProviders(this.config).boot(this.container);
            new PortsProviders(this.config).boot(this.container);

            this.booted = true;
        }

        // public module API
        api(): ApiType {
            this.boot();
            return investmentAccountsApi(this.container);
        }

        isHandleEvent(kind: string): boolean {
            return kind in investmentAccountsTechnicalHandler(new Container());
        }

        technicalEventHandler(): TechnicalHandlerType {
            this.boot();
            return investmentAccountsTechnicalHandler(this.container);
        }

        migration(): MigrationManager | never {
            this.boot();

            const migrations = require('../migrations');
            return new MigrationManager(DbProvider, {
                migrations,
                moduleName: InvestmentAccounts.moduleName
            });
        }
    }

    export function create(config: InvestmentAccounts.Config) {
        return new InvestmentAccounts.Main(config);
    }
}
