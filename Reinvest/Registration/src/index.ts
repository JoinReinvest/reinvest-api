import {Api, EventHandler, Module} from "Reinvest/Modules";
import Container, {ContainerInterface} from "Container/Container";
import {LegalEntities} from "LegalEntities/index";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {registrationApi, RegistrationApiType} from "Reinvest/Registration/src/Port/Api/RegistrationApiType";
import {
    registrationTechnicalHandler,
    RegistrationTechnicalHandlerType
} from "Reinvest/Registration/src/Port/Queue/RegistrationTechnicalHandlerType";

export namespace Registration {
    export const moduleName = "Registration";
    export type Config = {
        database: PostgreSQLConfig;
        northCapital: {
            CLIENT_ID: string,
            DEVELOPER_API_KEY: string,
            API_URL: string,
            OFFERING_ID: string,
        }
    };

    export type ModulesDependencies = {
        legalEntities: LegalEntities.Main
    }

    export type ApiType = RegistrationApiType & Api
    export type TechnicalHandlerType = RegistrationTechnicalHandlerType & EventHandler;

    export class Main implements Module {
        private readonly config: Registration.Config;
        private readonly container: ContainerInterface;
        private booted = false;
        private modules: Registration.ModulesDependencies;

        constructor(config: Registration.Config, modules: ModulesDependencies) {
            this.config = config;
            this.modules = modules;
            this.container = new Container();
        }

        private boot(): void {
            if (this.booted) {
                return;
            }

            this.container.addAsValue('LegalEntities', this.modules.legalEntities);
            // new AdapterServiceProvider(this.config).boot(this.container);
            // new ServicesProvider(this.config).boot(this.container);
            // new PortsProvider(this.config).boot(this.container);

            this.booted = true;
        }

        // public module API
        api(): ApiType {
            this.boot();
            return registrationApi(this.container);
        }

        isHandleEvent(kind: string): boolean {
            return kind in registrationTechnicalHandler(new Container());
        }

        technicalEventHandler(): TechnicalHandlerType {
            this.boot();
            return registrationTechnicalHandler(this.container);
        }

        migration(): any {
            throw new Error('not implemented');
        }

        async close(): Promise<void> {
            if (this.booted) {
                // await this.container.get<RegistrationDatabaseAdapterProvider>(RegistrationDatabaseAdapterProvider).close();
            }
        }
    }

    export function create(config: Registration.Config, modules: ModulesDependencies): Registration.Main {
        return new Registration.Main(config, modules);
    }
}