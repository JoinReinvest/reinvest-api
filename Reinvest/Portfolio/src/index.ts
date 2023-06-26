import Container, { ContainerInterface } from 'Container/Container';
import { PortfolioDatabaseAdapterInstanceProvider, PortfolioDatabaseAdapterProvider } from 'Portfolio/Adapter/Database/DatabaseAdapter';
import { DealpathConfig } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';
import { PortfolioApi, PortfolioApiType } from 'Portfolio/Port/Api/PortfolioApiType';
import { PortfolioTechnicalHandler, PortfolioTechnicalHandlerType } from 'Portfolio/Port/Queue/PortfolioTechnicalHandlerType';
import { AdapterServiceProvider } from 'Portfolio/Providers/AdapterServiceProvider';
import EventBusProvider from 'Portfolio/Providers/EventBusProvider';
import { PortsProvider } from 'Portfolio/Providers/PortsProvider';
import { UseCaseProvider } from 'Portfolio/Providers/UseCaseProvider';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';

import * as PortfolioMigrations from '../migrations';

export namespace Portfolio {
  export const moduleName = 'Portfolio';
  export type Config = {
    database: PostgreSQLConfig;
    dealpathConfig: DealpathConfig;
    queue: QueueConfig;
  };

  export type ApiType = PortfolioApiType & Api;
  export type TechnicalHandlerType = PortfolioTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Portfolio.Config;
    private readonly container: ContainerInterface;
    private booted = false;

    constructor(config: Portfolio.Config) {
      this.config = config;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return PortfolioApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in PortfolioTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return PortfolioTechnicalHandler(this.container);
    }

    migration(): any {
      return PortfolioMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<PortfolioDatabaseAdapterProvider>(PortfolioDatabaseAdapterInstanceProvider).close();
      }
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      new AdapterServiceProvider(this.config).boot(this.container);
      new UseCaseProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

      this.booted = true;
    }
  }

  export function create(config: Portfolio.Config): Portfolio.Main {
    return new Portfolio.Main(config);
  }
}
