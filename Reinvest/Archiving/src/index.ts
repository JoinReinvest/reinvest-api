import { ArchivingApi, ArchivingApiType } from 'Archiving/Port/Api/ArchivingApi';
import { archivingTechnicalHandler, ArchivingTechnicalHandlerType } from 'Archiving/Port/Queue/ArchivingTechnicalHandlerType';
import { AdapterServiceProvider } from 'Archiving/Providers/AdapterServiceProvider';
import EventBusProvider from 'Archiving/Providers/EventBusProvider';
import { PortsProvider } from 'Archiving/Providers/PortsProvider';
import { UseCaseProvider } from 'Archiving/Providers/UseCaseProvider';
import Container, { ContainerInterface } from 'Container/Container';
import { Investments } from 'Investments/index';
import { LegalEntities } from 'LegalEntities/index';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';
import { SharesAndDividends } from 'SharesAndDividends/index';

import * as ArchivingMigrations from '../migrations';

export namespace Archiving {
  export const moduleName = 'Archiving';
  export type Config = {
    database: PostgreSQLConfig;
    queue: QueueConfig;
  };

  export type ModulesDependencies = {
    investments: Investments.Main;
    legalEntities: LegalEntities.Main;
    sharesAndDividends: SharesAndDividends.Main;
  };

  export type ApiType = ArchivingApiType & Api;
  export type TechnicalHandlerType = ArchivingTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Archiving.Config;
    private booted = false;
    private container: ContainerInterface;
    private modules: Archiving.ModulesDependencies;

    constructor(config: Archiving.Config, modules: Archiving.ModulesDependencies) {
      this.config = config;
      this.modules = modules;
      this.container = new Container();
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      this.container.addAsValue('Investments', this.modules.investments);
      this.container.addAsValue('LegalEntities', this.modules.legalEntities);
      this.container.addAsValue('SharesAndDividends', this.modules.sharesAndDividends);

      new AdapterServiceProvider(this.config).boot(this.container);
      new UseCaseProvider(this.config).boot(this.container);
      new PortsProvider(this.config).boot(this.container);
      new EventBusProvider(this.config).boot(this.container);

      this.booted = true;
    }

    // public module API
    api(): ApiType {
      this.boot();

      return ArchivingApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in archivingTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return archivingTechnicalHandler(this.container);
    }

    migration() {
      return ArchivingMigrations;
    }

    async close(): Promise<void> {
      return;
    }
  }

  export function create(config: Archiving.Config, modules: Archiving.ModulesDependencies) {
    return new Archiving.Main(config, modules);
  }
}
