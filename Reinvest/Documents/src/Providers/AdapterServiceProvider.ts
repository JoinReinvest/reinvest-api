import { ContainerInterface } from 'Container/Container';
import { DatabaseAdapterInstance, DatabaseAdapterProvider } from 'Documents/Adapter/Database/DatabaseAdapter';
import { DocumentsPdfPageRepository } from 'Documents/Adapter/Repository/DocumentsPdfPageRepository';
import { FileLinkService } from 'Documents/Adapter/S3/FileLinkService';
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { Documents } from 'Documents/index';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export class AdapterServiceProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container));

    // database
    container
      .addAsValue(DatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database))
      .addSingleton(DocumentsPdfPageRepository, [DatabaseAdapterInstance, SimpleEventBus]);

    // s3
    container
      .addAsValue('S3Config', this.config.s3)
      .addAsValue('chromiumEndpoint', this.config.chromiumEndpoint)
      .addSingleton(S3Adapter, ['S3Config'])
      .addSingleton(FileLinkService, [S3Adapter, IdGenerator]);
  }
}
