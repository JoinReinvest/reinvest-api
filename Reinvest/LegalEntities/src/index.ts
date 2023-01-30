import Container, {ContainerInterface} from "Container/Container";
import {Api, EventHandler, Module} from "Reinvest/Modules";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import {PortsProvider} from "LegalEntities/Providers/PortsProvider";
import {LegalEntitiesApi, LegalEntitiesApiType} from "LegalEntities/Port/Api/LegalEntitiesApi";
import {
    LegalEntitiesTechnicalHandler,
    LegalEntitiesTechnicalHandlerType
} from "LegalEntities/Port/Events/LegalEntitiesTechnicalHandler";
import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {LegalEntitiesDatabase} from "LegalEntities/Adapter/Database/DatabaseAdapter";
import {AdapterServiceProvider} from "LegalEntities/Providers/AdapterServiceProvider";

export namespace LegalEntities {
    export const moduleName = "LegalEntities";
    export type Config = {
        database: PostgreSQLConfig
    };

    export type ApiType = LegalEntitiesApiType & Api;
    export type TechnicalHandlerType = LegalEntitiesTechnicalHandlerType & EventHandler;

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
            new AdapterServiceProvider(this.config).boot(this.container);
            new PortsProvider(this.config).boot(this.container);

            this.booted = true;
        }

        // public module API
        api(): ApiType {
            this.boot();
            return LegalEntitiesApi(this.container);
        }

        isHandleEvent(kind: string): boolean {
            return kind in LegalEntitiesTechnicalHandler(new Container());
        }

        technicalEventHandler(): TechnicalHandlerType {
            this.boot();
            return LegalEntitiesTechnicalHandler(this.container);
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
