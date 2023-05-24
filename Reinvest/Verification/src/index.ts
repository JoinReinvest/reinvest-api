import Container, { ContainerInterface } from 'Container/Container';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Registration } from 'Registration/index';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';
import { VerificationDatabaseAdapterInstanceProvider, VerificationDatabaseAdapterProvider } from 'Verification/Adapter/Database/DatabaseAdapter';
import { NorthCapitalConfig } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { verificationApi, VerificationApiType } from 'Verification/Port/Api/RegistrationApiType';
import { verificationTechnicalHandler, VerificationTechnicalHandlerType } from 'Verification/Port/Queue/VerificationTechnicalHandlerType';
import { AdapterServiceProvider } from 'Verification/Providers/AdapterServiceProvider';
import EventBusProvider from 'Verification/Providers/EventBusProvider';
import { IntegrationServiceProvider } from 'Verification/Providers/IntegrationServiceProvider';
import { PortsProvider } from 'Verification/Providers/PortsProvider';

import * as VerificationMigrations from '../migrations';

export namespace Verification {
  export const moduleName = 'Verification';
  export type Config = {
    database: PostgreSQLConfig;
    northCapital: NorthCapitalConfig;
    queue: QueueConfig;
  };

  export type ModulesDependencies = {
    registration: Registration.Main;
  };

  export type ApiType = VerificationApiType & Api;
  export type TechnicalHandlerType = VerificationTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Verification.Config;
    private readonly container: ContainerInterface;
    private booted = false;
    private modules: Verification.ModulesDependencies;

    constructor(config: Verification.Config, modules: ModulesDependencies) {
      this.config = config;
      this.modules = modules;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return verificationApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in verificationTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return verificationTechnicalHandler(this.container);
    }

    migration(): any {
      return VerificationMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<VerificationDatabaseAdapterProvider>(VerificationDatabaseAdapterInstanceProvider).close();
      }
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      this.container.addAsValue('Registration', this.modules.registration);
      new AdapterServiceProvider(this.config).boot(this.container);
      new IntegrationServiceProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

      this.booted = true;
    }
  }

  export function create(config: Verification.Config, modules: ModulesDependencies): Verification.Main {
    return new Verification.Main(config, modules);
  }
}
