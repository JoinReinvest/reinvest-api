import Container, { ContainerInterface } from 'Container/Container';
import { Documents } from 'Documents/index';
import { Portfolio } from 'Portfolio/index';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Registration } from 'Registration/index';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';
import { TradingDatabaseAdapterInstanceProvider, TradingDatabaseAdapterProvider } from 'Trading/Adapter/Database/DatabaseAdapter';
import { NorthCapitalConfig } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { VertaloConfig } from 'Trading/Adapter/Vertalo/ExecutionVertaloAdapter';
import { TradingApi, TradingApiType } from 'Trading/Port/Api/TradingApiType';
import { TradingTechnicalHandler, TradingTechnicalHandlerType } from 'Trading/Port/Queue/TradingTechnicalHandlerType';
import { AdapterServiceProvider } from 'Trading/Providers/AdapterServiceProvider';
import EventBusProvider from 'Trading/Providers/EventBusProvider';
import { IntegrationServiceProvider } from 'Trading/Providers/IntegrationServiceProvider';
import { PortsProvider } from 'Trading/Providers/PortsProvider';

import * as TradingMigrations from '../migrations';

export namespace Trading {
  export const moduleName = 'Trading';
  export type Config = {
    database: PostgreSQLConfig;
    northCapital: NorthCapitalConfig;
    queue: QueueConfig;
    vertalo: VertaloConfig;
  };

  export type ModulesDependencies = {
    documents: Documents.Main;
    portfolio: Portfolio.Main;
    registration: Registration.Main;
  };

  export type ApiType = TradingApiType & Api;
  export type TechnicalHandlerType = TradingTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Trading.Config;
    private readonly container: ContainerInterface;
    private booted = false;
    private modules: Trading.ModulesDependencies;

    constructor(config: Trading.Config, modules: ModulesDependencies) {
      this.config = config;
      this.modules = modules;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return TradingApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in TradingTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return TradingTechnicalHandler(this.container);
    }

    migration(): any {
      return TradingMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<TradingDatabaseAdapterProvider>(TradingDatabaseAdapterInstanceProvider).close();
      }
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      this.container.addAsValue('Registration', this.modules.registration);
      this.container.addAsValue('Portfolio', this.modules.portfolio);
      this.container.addAsValue('Documents', this.modules.documents);

      new AdapterServiceProvider(this.config).boot(this.container);
      new IntegrationServiceProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

      this.booted = true;
    }
  }

  export function create(config: Trading.Config, modules: ModulesDependencies): Trading.Main {
    return new Trading.Main(config, modules);
  }
}
