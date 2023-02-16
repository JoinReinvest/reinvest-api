import Container, {ContainerInterface} from "Container/Container";
import EventBusProvider from "InvestmentAccounts/Infrastructure/Providers/EventBusProvider";
import {Api, EventHandler, Module} from "Reinvest/Modules";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {
    investmentAccountsApi,
    InvestmentAccountsApiType
} from "InvestmentAccounts/Infrastructure/Ports/InvestmentAccountsApi";
import {
    investmentAccountsTechnicalHandler, InvestmentAccountsTechnicalHandlerType
} from "InvestmentAccounts/Infrastructure/Events/InvestmentAccountsTechnicalHandler";
import PortsProviders from "InvestmentAccounts/Infrastructure/Providers/PortsProviders";
import AdaptersProviders from "InvestmentAccounts/Infrastructure/Providers/AdaptersProviders";
import UseCaseProviders from "InvestmentAccounts/Infrastructure/Providers/UseCaseProviders";
import * as InvestmentAccountsMigrations from "../migrations";

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

            new AdaptersProviders(this.config).boot(this.container);
            new UseCaseProviders(this.config).boot(this.container);
            new PortsProviders(this.config).boot(this.container);
            new EventBusProvider(this.config).boot(this.container);

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

        migration() {
            return InvestmentAccountsMigrations;
        }
    }

    export function create(config: InvestmentAccounts.Config) {
        return new InvestmentAccounts.Main(config);
    }
}
