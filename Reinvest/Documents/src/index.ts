import Container, {ContainerInterface} from "Container/Container";
import {Api, EventHandler, Module} from "Reinvest/Modules";
import {MigrationManager} from "PostgreSQL/MigrationManager";
import {PortsProvider} from "Documents/Providers/PortsProvider";
import {DocumentsApi, DocumentsApiType} from "Documents/Port/Api/DocumentsApi";
import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {DocumentsDatabase} from "Documents/Adapter/Database/DatabaseAdapter";
import {AdapterServiceProvider} from "Documents/Providers/AdapterServiceProvider";
import {S3Config} from "Documents/Adapter/S3/S3Adapter";
import {NoMigrationException} from "PostgreSQL/NoMigrationException";

export namespace Documents {
    export const moduleName = "Documents";
    export type Config = {
        database: PostgreSQLConfig,
        s3: S3Config
    };

    export type ApiType = DocumentsApiType & Api;
    export type TechnicalHandlerType = EventHandler;

    export class Main implements Module {
        private readonly config: Documents.Config;
        private booted = false;
        private container: ContainerInterface;

        constructor(config: Documents.Config) {
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
            return DocumentsApi(this.container);
        }

        isHandleEvent(kind: string): boolean {
            return false;
        }

        technicalEventHandler(): TechnicalHandlerType {
            return {};
        }

        migration() {

            throw new NoMigrationException();
            // this.boot();
            // const migrations = require('../migrations');
            // const dbProvider = new DatabaseProvider<DocumentsDatabase>(this.config.database);
            // return new MigrationManager(dbProvider, {
            //     migrations,
            //     moduleName: Documents.moduleName
            // });
        }


    }

    export function create(config: Documents.Config) {
        return new Documents.Main(config);
    }
}
