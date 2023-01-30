import Container, {ContainerInterface} from "Container/Container";

import {MigrationManager} from "PostgreSQL/MigrationManager";
import {Api, Module} from "Reinvest/Modules";
import {NoMigrationException} from "PostgreSQL/NoMigrationException";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {IdentityApi, IdentityApiType} from "Identity/Port/Api/IdentityApi";
import {PortsProvider} from "Identity/Providers/PortsProvider";
import {AdapterServiceProvider} from "Identity/Providers/AdapterServiceProvider";
import {IdentityTechnicalHandler} from "Identity/Port/Events/IdentityTechnicalHandler";

export namespace Identity {
    export const moduleName = "Identity";
    export type Config = {
        database: PostgreSQLConfig;
    };

    export type ApiType = IdentityApiType & Api

    export class Main implements Module {
        private readonly config: Identity.Config;
        private readonly container: ContainerInterface;
        private booted = false;

        constructor(config: Identity.Config) {
            this.config = config;
            this.container = new Container();
        }

        private boot(): void {
            if (this.booted) {
                return;
            }

            new PortsProvider(this.config).boot(this.container);
            new AdapterServiceProvider(this.config).boot(this.container);

            this.booted = true;
        }

        // public module API
        api(): ApiType {
            this.boot();
            return IdentityApi(this.container);
        }

        isHandleEvent(kind: string): boolean {
            return kind in IdentityTechnicalHandler;
        }

        technicalEventHandler() {
            this.boot();
            return IdentityTechnicalHandler;
        }

        migration(): MigrationManager | never {
            throw new NoMigrationException('Module does not support database migrations');
        }
    }

    export function create(config: Identity.Config) {
        return new Identity.Main(config);
    }
}
