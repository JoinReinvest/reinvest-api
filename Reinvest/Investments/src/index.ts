import Container, { ContainerInterface } from 'Container/Container';
import { InvestmentsDatabaseAdapterInstanceProvider, InvestmentsDatabaseAdapterProvider } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';

import * as InvestmentsMigrations from '../migrations';
import { investmentsTechnicalHandler, InvestmentsTechnicalHandlerType } from './Infrastructure/Events/InvestmentsTechnicalHandler';
import { investmentsApi, InvestmentsApiType } from './Infrastructure/Ports/InvestmentsApi';
import AdaptersProviders from './Infrastructure/Providers/AdaptersProviders';
import EventBusProvider from './Infrastructure/Providers/EventBusProvider';
import PortsProviders from './Infrastructure/Providers/PortsProviders';
import UseCaseProviders from './Infrastructure/Providers/UseCaseProviders';

export namespace Investments {
  export const moduleName = 'Investments';
  export type Config = {
    database: PostgreSQLConfig;
    queue: QueueConfig;
  };

  export type ApiType = InvestmentsApiType & Api;
  export type TechnicalHandlerType = InvestmentsTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Investments.Config;
    private readonly container: ContainerInterface;
    private booted = false;

    constructor(config: Investments.Config) {
      this.config = config;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return investmentsApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in investmentsTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return investmentsTechnicalHandler(this.container);
    }

    migration() {
      return InvestmentsMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<InvestmentsDatabaseAdapterProvider>(InvestmentsDatabaseAdapterInstanceProvider).close();
      }
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      new AdaptersProviders(this.config).boot(this.container);
      new UseCaseProviders(this.config).boot(this.container);
      new PortsProviders(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

      this.booted = true;
    }
  }

  export function create(config: Investments.Config) {
    return new Investments.Main(config);
  }
}
