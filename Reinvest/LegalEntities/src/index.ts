import Container, { ContainerInterface } from 'Container/Container';
import { Documents } from 'Documents/index';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { InvestmentAccountDbProvider, investmentAccountsDatabaseProviderName } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { LegalEntitiesDatabaseAdapterInstanceProvider, LegalEntitiesDatabaseAdapterProvider } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesApi, LegalEntitiesApiType } from 'LegalEntities/Port/Api/LegalEntitiesApi';
import { LegalEntitiesTechnicalHandler, LegalEntitiesTechnicalHandlerType } from 'LegalEntities/Port/Events/LegalEntitiesTechnicalHandler';
import { AdapterServiceProvider } from 'LegalEntities/Providers/AdapterServiceProvider';
import EventBusProvider from 'LegalEntities/Providers/EventBusProvider';
import { PortsProvider } from 'LegalEntities/Providers/PortsProvider';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';

import * as LegalEntitiesMigrations from '../migrations';

export namespace LegalEntities {
  export const moduleName = 'LegalEntities';
  export type Config = {
    database: PostgreSQLConfig;
    queue: QueueConfig;
  };

  export type ModulesDependencies = {
    documents: Documents.Main;
    investmentAccounts: InvestmentAccounts.Main;
  };

  export type ApiType = LegalEntitiesApiType & Api;
  export type TechnicalHandlerType = LegalEntitiesTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: LegalEntities.Config;
    private booted = false;
    private container: ContainerInterface;
    private modules: LegalEntities.ModulesDependencies;

    constructor(config: LegalEntities.Config, modules: ModulesDependencies) {
      this.config = config;
      this.modules = modules;
      this.container = new Container();
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      this.container.addAsValue('Documents', this.modules.documents);
      this.container.addAsValue('InvestmentAccounts', this.modules.investmentAccounts);

      new AdapterServiceProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

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

    migration() {
      return LegalEntitiesMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<LegalEntitiesDatabaseAdapterProvider>(LegalEntitiesDatabaseAdapterInstanceProvider).close();
      }
    }
  }

  export function create(config: LegalEntities.Config, modules: LegalEntities.ModulesDependencies) {
    return new LegalEntities.Main(config, modules);
  }
}
