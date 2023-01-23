import Container, {ContainerInterface} from "Container/Container";
import {Api, EventHandler, Module} from "Reinvest/Modules";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import {ControllerProvider} from "LegalEntities/Providers/ControllerProvider";
import {NoMigrationException} from "PostgreSQL/NoMigrationException";
import {LegalEntitiesApi} from "LegalEntities/Port/Api/LegalEntitiesApi";
import {ApiRegistration, executeApi} from "Container/ApiExecutor";
import {LegalEntitiesTechnicalHandler} from "LegalEntities/Port/Events/LegalEntitiesTechnicalHandler";
import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {DatabaseServiceProvider} from "LegalEntities/Providers/DatabaseServiceProvider";

export namespace LegalEntities {
    export const moduleName = "LegalEntities";
    export type Config = {
        database: PostgreSQLConfig
    };

    export type LegalEntitiesApiType = typeof LegalEntitiesApi & Api;
    export type LegalEntitiesTechnicalHandlerType = typeof LegalEntitiesTechnicalHandler & EventHandler;

    export class Main implements Module {
        private readonly config: LegalEntities.Config;
        private booted = false;
        private container: ContainerInterface;

        constructor(config: LegalEntities.Config) {
            this.config = config;
            this.container = new Container();
        }

        private boot(): void {
            if (this.booted) {
                return;
            }
            new DatabaseServiceProvider(this.config).boot(this.container);
            new ControllerProvider(this.config).boot(this.container);

            this.booted = true;
        }

        // public module API
        api(): LegalEntitiesApiType {
            this.boot();
            return executeApi<LegalEntitiesApiType>(this.container, LegalEntitiesApi as unknown as ApiRegistration);
        }

        isHandleEvent(kind: string): boolean {
            return kind in LegalEntitiesTechnicalHandler;
        }

        technicalEventHandler(): LegalEntitiesTechnicalHandlerType {
            this.boot();
            return executeApi<LegalEntitiesTechnicalHandlerType>(this.container, LegalEntitiesTechnicalHandler as unknown as ApiRegistration);
        }

        migration(): MigrationManager | never {
            this.boot();
            const migrations = require('../migrations');
            const dbProvider = new DatabaseProvider<LegalEntitiesDatabase>(this.config.database);
            return new MigrationManager(dbProvider, {
                migrations,
                moduleName: LegalEntities.moduleName
            });
        }


    }

    export function create(config: LegalEntities.Config) {
        return new LegalEntities.Main(config);
    }
}
