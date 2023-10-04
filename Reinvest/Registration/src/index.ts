import Container, { ContainerInterface } from 'Container/Container';
import { Documents } from 'Documents/index';
import { Identity } from 'LegalEntities/Adapter/Modules/IdentityService';
import { LegalEntities } from 'LegalEntities/index';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { RegistrationDatabaseAdapterInstanceProvider, RegistrationDatabaseAdapterProvider } from 'Registration/Adapter/Database/DatabaseAdapter';
import { NorthCapitalConfig } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { VertaloConfig } from 'Registration/Adapter/Vertalo/ExecutionVertaloAdapter';
import { registrationApi, RegistrationApiType } from 'Registration/Port/Api/RegistrationApiType';
import { registrationTechnicalHandler, RegistrationTechnicalHandlerType } from 'Registration/Port/Queue/RegistrationTechnicalHandlerType';
import { AdapterServiceProvider } from 'Registration/Providers/AdapterServiceProvider';
import EventBusProvider from 'Registration/Providers/EventBusProvider';
import { IntegrationServiceProvider } from 'Registration/Providers/IntegrationServiceProvider';
import { PortsProvider } from 'Registration/Providers/PortsProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';

import * as RegistrationMigrations from '../migrations';

export namespace Registration {
  export const moduleName = 'Registration';
  export type Config = {
    database: PostgreSQLConfig;
    emailDomain: string;
    northCapital: NorthCapitalConfig;
    vertalo: VertaloConfig;
  };

  export type ModulesDependencies = {
    documents: Documents.Main;
    legalEntities: LegalEntities.Main;
    identity: Identity.Main;
  };

  export type ApiType = RegistrationApiType & Api;
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
      this.container.addAsValue('Identity', this.modules.identity);
      this.container.addAsValue('Documents', this.modules.documents);
      new AdapterServiceProvider(this.config).boot(this.container);
      new IntegrationServiceProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);

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
      return RegistrationMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<RegistrationDatabaseAdapterProvider>(RegistrationDatabaseAdapterInstanceProvider).close();
      }
    }
  }

  export function create(config: Registration.Config, modules: ModulesDependencies): Registration.Main {
    return new Registration.Main(config, modules);
  }
}
