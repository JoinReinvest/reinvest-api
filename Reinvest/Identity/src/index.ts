import Container, {ContainerInterface} from "Container/Container";

import {MigrationManager} from "PostgreSQL/MigrationManager";
import {Module} from "Reinvest/Modules";
import {NoMigrationException} from "PostgreSQL/NoMigrationException";

export namespace Identity {
    export const moduleName = "Identity";
    export type Config = {
        database: {
            connectionString: string;
        };
    };

    export const technicalEventHandler = {};

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

            this.booted = true;
        }

        // public module API
        api() {
            this.boot();
            return { // move to other file + add DI
                registerUser: (userId: string, profileId: string) => {},
                getProfile: (userId: string) => '27fad77f-f160-44a8-8611-b19f6e76a253'
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
            throw new NoMigrationException('Module does not support database migrations');
        }
    }

    export function create(config: Identity.Config) {
        return new Identity.Main(config);
    }
}
