import Container, { ContainerInterface } from 'Container/Container';
import { Identity } from 'Identity/index';
import { Notifications } from 'Notifications/index';
import { Portfolio } from 'Portfolio/index';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';
import {
  SharesAndDividendsDatabaseAdapterInstanceProvider,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { SharesAndDividendsApi, SharesAndDividendsApiType } from 'SharesAndDividends/Port/Api/SharesAndDividendsApiType';
import {
  SharesAndDividendsTechnicalHandler,
  SharesAndDividendsTechnicalHandlerType,
} from 'SharesAndDividends/Port/Queue/SharesAndDividendsTechnicalHandlerType';
import { AdapterServiceProvider } from 'SharesAndDividends/Providers/AdapterServiceProvider';
import EventBusProvider from 'SharesAndDividends/Providers/EventBusProvider';
import { PortsProvider } from 'SharesAndDividends/Providers/PortsProvider';
import { UseCaseProvider } from 'SharesAndDividends/Providers/UseCaseProvider';

import * as SharesAndDividendsMigrations from '../migrations';

export namespace SharesAndDividends {
  export const moduleName = 'SharesAndDividends';
  export type Config = {
    database: PostgreSQLConfig;
    queue: QueueConfig;
  };

  export type ModulesDependencies = {
    identity: Identity.Main;
    notifications: Notifications.Main;
    portfolio: Portfolio.Main;
  };

  export type ApiType = SharesAndDividendsApiType & Api;
  export type TechnicalHandlerType = SharesAndDividendsTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: SharesAndDividends.Config;
    private readonly container: ContainerInterface;
    private booted = false;
    private modules: SharesAndDividends.ModulesDependencies;

    constructor(config: SharesAndDividends.Config, modules: ModulesDependencies) {
      this.config = config;
      this.modules = modules;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return SharesAndDividendsApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in SharesAndDividendsTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return SharesAndDividendsTechnicalHandler(this.container);
    }

    migration(): any {
      return SharesAndDividendsMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<SharesAndDividendsDatabaseAdapterProvider>(SharesAndDividendsDatabaseAdapterInstanceProvider).close();
      }
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      this.container.addAsValue('Portfolio', this.modules.portfolio);
      this.container.addAsValue('Notifications', this.modules.notifications);
      this.container.addAsValue('Identity', this.modules.identity);

      new AdapterServiceProvider(this.config).boot(this.container);
      new UseCaseProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

      this.booted = true;
    }
  }

  export function create(config: SharesAndDividends.Config, modules: SharesAndDividends.ModulesDependencies): SharesAndDividends.Main {
    return new SharesAndDividends.Main(config, modules);
  }
}
