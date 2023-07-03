import Container, { ContainerInterface } from 'Container/Container';
import { CognitoConfig } from 'Identity/Adapter/AWS/CognitoService';
import { SNSConfig } from 'Identity/Adapter/AWS/SmsService';
import { DatabaseAdapterProvider, IdentityDatabaseAdapterProvider } from 'Identity/Adapter/Database/IdentityDatabaseAdapter';
import { identityApi, IdentityApiType } from 'Identity/Port/Api/IdentityApi';
import { identityTechnicalHandler, IdentityTechnicalHandlerType } from 'Identity/Port/Events/IdentityTechnicalHandler';
import { AdapterServiceProvider } from 'Identity/Providers/AdapterServiceProvider';
import { PortsProvider } from 'Identity/Providers/PortsProvider';
import { ServicesProvider } from 'Identity/Providers/ServicesProvider';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';

import * as IdentityMigrations from '../migrations';

export namespace Identity {
  export const moduleName = 'Identity';
  export type Config = {
    Cognito: CognitoConfig;
    SNS: SNSConfig;
    database: PostgreSQLConfig;
    queue: QueueConfig;
    webAppUrl: string;
  };

  export type ModulesDependencies = {
    investmentAccounts: InvestmentAccounts.Main;
  };

  export type ApiType = IdentityApiType & Api;
  export type TechnicalHandlerType = IdentityTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Identity.Config;
    private readonly container: ContainerInterface;
    private booted = false;
    private modules: Identity.ModulesDependencies;

    constructor(config: Identity.Config, modules: ModulesDependencies) {
      this.config = config;
      this.modules = modules;
      this.container = new Container();
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      this.container.addAsValue('InvestmentAccounts', this.modules.investmentAccounts);
      new AdapterServiceProvider(this.config).boot(this.container);
      new ServicesProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);

      this.booted = true;
    }

    // public module API
    api(): ApiType {
      this.boot();

      return identityApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in identityTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return identityTechnicalHandler(this.container);
    }

    migration() {
      return IdentityMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<IdentityDatabaseAdapterProvider>(DatabaseAdapterProvider).close();
      }
    }
  }

  export function create(config: Identity.Config, modules: Identity.ModulesDependencies) {
    return new Identity.Main(config, modules);
  }
}
