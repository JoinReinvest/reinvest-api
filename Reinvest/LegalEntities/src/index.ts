import Container, {ContainerInterface} from "Container/Container";
import {Api, Module} from "Reinvest/Modules";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";
import {DatabaseProvider} from "LegalEntities/Providers/DatabaseProvider";
import {ControllerProvider} from "LegalEntities/Providers/ControllerProvider";
import {PeopleController} from "LegalEntities/Port/Api/PeopleController";
import {InputParameters} from "LegalEntities/Port/Api/InputParameters";
import {NoMigrationException} from "PostgreSQL/NoMigrationException";

export namespace LegalEntities {
    export const moduleName = "LegalEntities";
    const container = new Container();
    export type Config = {
        database: {
            connectionString: string;
        };
    };

    const legalEntitiesApi = { // move to other file + add DI
        completePerson: async (parameters: any) => await execute(PeopleController.toString(), "completePerson", parameters)
    };

    const technicalEventHandler = { // todo move to other files + add DI
        // ProfileCreated: async (event: any) => console.log({eventInModuleHandler: event}),
    };

    export type LegalEntitiesApi = Api | typeof legalEntitiesApi;

    async function execute(className: string, method: string, parameters: any): any {
        const inputParameters = new InputParameters(parameters);
        const controller = container.getValue(className);

        return controller[method](inputParameters);
    }


    export class Main implements Module {
        private readonly config: LegalEntities.Config;
        private booted = false;

        constructor(config: LegalEntities.Config) {
            this.config = config;
        }

        private boot(): void {
            if (this.booted) {
                return;
            }
            new DatabaseProvider(this.config).boot(container);
            new ControllerProvider(this.config).boot(container);

            this.booted = true;
        }

        // public module API
        api(): LegalEntitiesApi {
            this.boot();
            return legalEntitiesApi;
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
            throw new NoMigrationException();
            // const migrations = require('../migrations');
            // return new MigrationManager(DbProvider, {
            //     migrations,
            //     moduleName: LegalEntities.moduleName
            // });
        }
    }

    export function create(config: LegalEntities.Config) {
        return new LegalEntities.Main(config);
    }

    export type ss = typeof Main.api;
}
