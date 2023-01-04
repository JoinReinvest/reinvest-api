import Container, {ContainerInterface} from "Container/Container";
import QueryProviders from "InvestmentAccounts/Providers/QueryProviders";
import {
    createProfileResolver,
    getProfileByUserResolver,
} from "InvestmentAccounts/Resolvers";

import ServiceProviders from "InvestmentAccounts/Providers/ServiceProviders";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";
import {MigrationManager} from "PostgreSQL/MigrationManager";

export namespace InvestmentAccounts {
    export const moduleName = "InvestmentAccounts";
    export type Config = {
        database: {
            connectionString: string;
        };
    };

    export class Module {
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

            new ServiceProviders(this.config).boot(this.container);
            new QueryProviders(this.config).boot(this.container);

            this.booted = true;
        }

        // public module API
        api() {
            this.boot();

            return {
                createProfile: async (userId: string) => await createProfileResolver(this.container, userId),
                getProfileByUser: async (userId: string) => await getProfileByUserResolver(this.container, userId),
            };
        }

        migration(): MigrationManager {
            this.boot();

            const migrations = require('../migrations');
            return new MigrationManager(DbProvider, {
                migrations,
                moduleName: InvestmentAccounts.moduleName
            });
        }
    }

    export function create(config: InvestmentAccounts.Config) {
        return new InvestmentAccounts.Module(config);
    }
}
