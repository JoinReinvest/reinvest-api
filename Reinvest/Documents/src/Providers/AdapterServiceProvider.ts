import { ContainerInterface } from 'Container/Container';
import { DatabaseAdapterProvider, DocumentsDatabaseAdapterInstance } from 'Documents/Adapter/Database/DatabaseAdapter';
import { CalculationsRepository } from 'Documents/Adapter/Repository/CalculationsRepository'
import { DocumentsPdfPageRepository } from 'Documents/Adapter/Repository/DocumentsPdfPageRepository';
import { FileLinkService } from 'Documents/Adapter/S3/FileLinkService';
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { Documents } from 'Documents/index';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { GeneratePdfEventHandler } from 'SimpleAggregator/EventBus/GeneratePdfEventHandler';

export class AdapterServiceProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory('PdfGeneratorQueueSender', () => new QueueSender(this.config.pdfGeneratorQueue), [])
      .addObjectFactory(GeneratePdfEventHandler, (queueSender: QueueSender) => new GeneratePdfEventHandler(queueSender), ['PdfGeneratorQueueSender']);

    // database
    container
      .addAsValue(DocumentsDatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database))
      .addSingleton(DocumentsPdfPageRepository, [DocumentsDatabaseAdapterInstance, SimpleEventBus])
      .addSingleton(CalculationsRepository, [DocumentsDatabaseAdapterInstance]);

    // s3
    container
      .addAsValue('S3Config', this.config.s3)
      .addAsValue('chromiumEndpoint', this.config.chromiumEndpoint)
      .addSingleton(S3Adapter, ['S3Config'])
      .addSingleton(FileLinkService, [S3Adapter, IdGenerator]);
  }
}
