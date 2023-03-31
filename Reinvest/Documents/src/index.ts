import Container, { ContainerInterface } from 'Container/Container';
import { S3Config } from 'Documents/Adapter/S3/S3Adapter';
import { DocumentsApi, DocumentsApiType } from 'Documents/Port/Api/DocumentsApi';
import { AdapterServiceProvider } from 'Documents/Providers/AdapterServiceProvider';
import { PortsProvider } from 'Documents/Providers/PortsProvider';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { NoMigrationException } from 'PostgreSQL/NoMigrationException';
import { Api, EventHandler, Module } from 'Reinvest/Modules';

export namespace Documents {
  export const moduleName = 'Documents';
  export type Config = {
    database: PostgreSQLConfig;
    s3: S3Config;
  };

  export type ApiType = DocumentsApiType & Api;
  export type TechnicalHandlerType = EventHandler;

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
      new PortsProvider(this.config).boot(this.container);

      this.booted = true;
    }

    // public module API
    api(): ApiType {
      this.boot();

      return DocumentsApi(this.container);
    }

    isHandleEvent(kind: string): boolean {
      return false;
    }

    technicalEventHandler(): TechnicalHandlerType {
      return {};
    }

    migration() {
      throw new NoMigrationException();
    }

    async close(): Promise<void> {}
  }

  export function create(config: Documents.Config) {
    return new Documents.Main(config);
  }
}
