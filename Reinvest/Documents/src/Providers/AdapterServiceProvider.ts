import { ContainerInterface } from 'Container/Container';
import { DatabaseAdapterInstance, DatabaseAdapterProvider } from 'Documents/Adapter/Database/DatabaseAdapter';
import { FileLinkService } from 'Documents/Adapter/S3/FileLinkService';
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { Documents } from 'Documents/index';
import { IdGenerator } from 'IdGenerator/IdGenerator';

export class AdapterServiceProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    // database
    container.addAsValue(DatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database));

    // s3
    container
      .addAsValue('S3Config', this.config.s3)
      .addAsValue('chromiumEndpoint', this.config.chromiumEndpoint)
      .addSingleton(S3Adapter, ['S3Config'])
      .addSingleton(FileLinkService, [S3Adapter, IdGenerator]);
  }
}
