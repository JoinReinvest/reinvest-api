import Container, { ContainerInterface } from 'Container/Container';
import { NotificationsDatabaseAdapterInstanceProvider, NotificationsDatabaseAdapterProvider } from 'Notifications/Adapter/Database/DatabaseAdapter';
import { NotificationsApi, NotificationsApiType } from 'Notifications/Port/Api/NotificationsApiType';
import { NotificationsTechnicalHandler } from 'Notifications/Port/Queue/NotificationsTechnicalHandlerType';
import { AdapterServiceProvider } from 'Notifications/Providers/AdapterServiceProvider';
import EventBusProvider from 'Notifications/Providers/EventBusProvider';
import { PortsProvider } from 'Notifications/Providers/PortsProvider';
import { UseCaseProvider } from 'Notifications/Providers/UseCaseProvider';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';

import * as NotificationsMigrations from '../migrations';

export namespace Notifications {
  export const moduleName = 'Notifications';
  export type Config = {
    database: PostgreSQLConfig;
    queue: QueueConfig;
  };

  export type ApiType = NotificationsApiType & Api;
  export type TechnicalHandlerType = EventHandler;

  export class Main implements Module {
    private readonly config: Notifications.Config;
    private readonly container: ContainerInterface;
    private booted = false;

    constructor(config: Notifications.Config) {
      this.config = config;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return NotificationsApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in NotificationsTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return NotificationsTechnicalHandler(this.container);
    }

    migration(): any {
      return NotificationsMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<NotificationsDatabaseAdapterProvider>(NotificationsDatabaseAdapterInstanceProvider).close();
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

  export function create(config: Notifications.Config): Notifications.Main {
    return new Notifications.Main(config);
  }
}
