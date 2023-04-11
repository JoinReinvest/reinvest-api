import Container, { ContainerInterface } from 'Container/Container';
import {
  investmentAccountsTechnicalHandler,
  InvestmentAccountsTechnicalHandlerType,
} from 'InvestmentAccounts/Infrastructure/Events/InvestmentAccountsTechnicalHandler';
import { investmentAccountsApi, InvestmentAccountsApiType } from 'InvestmentAccounts/Infrastructure/Ports/InvestmentAccountsApi';
import AdaptersProviders from 'InvestmentAccounts/Infrastructure/Providers/AdaptersProviders';
import EventBusProvider from 'InvestmentAccounts/Infrastructure/Providers/EventBusProvider';
import PortsProviders from 'InvestmentAccounts/Infrastructure/Providers/PortsProviders';
import UseCaseProviders from 'InvestmentAccounts/Infrastructure/Providers/UseCaseProviders';
import { InvestmentAccountDbProvider, investmentAccountsDatabaseProviderName } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';

import * as InvestmentAccountsMigrations from '../migrations';

export namespace InvestmentAccounts {
  export const moduleName = 'InvestmentAccounts';
  export type Config = {
    database: PostgreSQLConfig;
    queue: QueueConfig;
  };

  export type ApiType = InvestmentAccountsApiType & Api;
  export type TechnicalHandlerType = InvestmentAccountsTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: InvestmentAccounts.Config;
    private readonly container: ContainerInterface;
    private booted = false;

    constructor(config: InvestmentAccounts.Config) {
      this.config = config;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return investmentAccountsApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in investmentAccountsTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return investmentAccountsTechnicalHandler(this.container);
    }

    migration() {
      return InvestmentAccountsMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<InvestmentAccountDbProvider>(investmentAccountsDatabaseProviderName).close();
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

  export function create(config: InvestmentAccounts.Config) {
    return new InvestmentAccounts.Main(config);
  }
}
