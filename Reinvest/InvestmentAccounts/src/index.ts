import Container, {ContainerInterface} from "Container/Container";
import QueryProviders from "InvestmentAccounts/Providers/QueryProviders";
import {
    createProfileResolver,
    getProfileByUserResolver,
} from "InvestmentAccounts/Resolvers";

import ServiceProviders from "InvestmentAccounts/Providers/ServiceProviders";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import EventBusProvider from "InvestmentAccounts/Providers/EventBusProvider";
import {Module} from "Reinvest/Modules";

export namespace InvestmentAccounts {
    export const moduleName = "InvestmentAccounts";
    export type Config = {
        database: {
            connectionString: string;
        };
    };

    export const technicalEventHandler = { // todo move to other files + add DI
        // ProfileCreated: async (event: any) => console.log({eventInModuleHandler: event}),
    };

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

            this.booted = true;
        }

        // public module API
        api() {
            this.boot();
            return { // move to other file + add DI
                createProfile: async (userId: string, email: string) => await createProfileResolver(this.container, userId, email),
                getProfileByUser: async (userId: string) => await getProfileByUserResolver(this.container, userId),
            };
        }

        isHandleEvent(kind: string): boolean {
            return kind in technicalEventHandler;
        }

        technicalEventHandler() {
            this.boot();
            return technicalEventHandler;
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
