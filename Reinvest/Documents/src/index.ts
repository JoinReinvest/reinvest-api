import Container, { ContainerInterface } from 'Container/Container';
import { S3Config } from 'Documents/Adapter/S3/S3Adapter';
import { DocumentsApi, DocumentsApiType } from 'Documents/Port/Api/DocumentsApi';
import { documentsTechnicalHandler, DocumentsTechnicalHandlerType } from 'Documents/Port/Queue/DocumentsTechnicalHandlerType';
import { AdapterServiceProvider } from 'Documents/Providers/AdapterServiceProvider';
import EventBusProvider from 'Documents/Providers/EventBusProvider';
import { PortsProvider } from 'Documents/Providers/PortsProvider';
import { UseCaseProvider } from 'Documents/Providers/UseCaseProvider';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { Api, EventHandler, Module } from 'Reinvest/Modules';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';

import * as DocumentsMigrations from '../migrations';

export namespace Documents {
  export const moduleName = 'Documents';
  export type Config = {
    chromiumEndpoint: string;
    database: PostgreSQLConfig;
    pdfGeneratorQueue: QueueConfig;
    s3: S3Config;
  };

  export type ApiType = DocumentsApiType & Api;
  export type TechnicalHandlerType = DocumentsTechnicalHandlerType & EventHandler;

  export class Main implements Module {
    private readonly config: Documents.Config;
    private booted = false;
    private container: ContainerInterface;

    constructor(config: Documents.Config) {
      this.config = config;
      this.container = new Container();
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

    // public module API
    api(): ApiType {
      this.boot();

      return DocumentsApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return kind in documentsTechnicalHandler(new Container());
    }

    technicalEventHandler(): TechnicalHandlerType {
      this.boot();

      return documentsTechnicalHandler(this.container);
    }

    migration() {
      return DocumentsMigrations;
    }

    async close(): Promise<void> {
      return;
    }
  }

  export function create(config: Documents.Config) {
    return new Documents.Main(config);
  }
}
