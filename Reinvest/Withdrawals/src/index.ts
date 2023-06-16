import Container, { ContainerInterface } from 'Container/Container';
import { Documents } from 'Documents/index';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Registration } from 'Registration/index';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { WithdrawalsDatabaseAdapterInstanceProvider, WithdrawalsDatabaseAdapterProvider } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { WithdrawalsApi, WithdrawalsApiType } from 'Withdrawals/Port/Api/WithdrawalsApiType';
import { WithdrawalsTechnicalHandler, WithdrawalsTechnicalHandlerType } from 'Withdrawals/Port/Queue/WithdrawalsTechnicalHandlerType';
import { AdapterServiceProvider } from 'Withdrawals/Providers/AdapterServiceProvider';
import EventBusProvider from 'Withdrawals/Providers/EventBusProvider';
import { PortsProvider } from 'Withdrawals/Providers/PortsProvider';
import { UseCaseServiceProvider } from 'Withdrawals/Providers/UseCaseServiceProvider';

import * as WithdrawalsMigrations from '../migrations';

export namespace Withdrawals {
  export const moduleName = 'Withdrawals';
  export type Config = {
    database: PostgreSQLConfig;
    queue: QueueConfig;
  };

  export type ModulesDependencies = {
    documents: Documents.Main;
    registration: Registration.Main;
    sharesAndDividends: SharesAndDividends.Main;
  };

  export type ApiType = WithdrawalsApiType & Api;
  export type TechnicalHandlerType = WithdrawalsTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Withdrawals.Config;
    private readonly container: ContainerInterface;
    private booted = false;
    private modules: Withdrawals.ModulesDependencies;

    constructor(config: Withdrawals.Config, modules: ModulesDependencies) {
      this.config = config;
      this.modules = modules;
      this.container = new Container();
    }

    // public module API
    api(): ApiType {
      this.boot();

      return WithdrawalsApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in WithdrawalsTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return WithdrawalsTechnicalHandler(this.container);
    }

    migration(): any {
      return WithdrawalsMigrations;
    }

    async close(): Promise<void> {
      if (this.booted) {
        await this.container.getValue<WithdrawalsDatabaseAdapterProvider>(WithdrawalsDatabaseAdapterInstanceProvider).close();
      }
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      this.container.addAsValue('SharesAndDividends', this.modules.sharesAndDividends);
      this.container.addAsValue('Documents', this.modules.documents);
      this.container.addAsValue('Registration', this.modules.registration);

      new AdapterServiceProvider(this.config).boot(this.container);
      new UseCaseServiceProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

      this.booted = true;
    }
  }

  export function create(config: Withdrawals.Config, modules: ModulesDependencies): Withdrawals.Main {
    return new Withdrawals.Main(config, modules);
  }
}
