import { ArchivingDatabaseAdapterInstance, DatabaseAdapterProvider } from 'Archiving/Adapter/Database/DatabaseAdapter';
import { ArchivingBeneficiaryRepository } from 'Archiving/Adapter/Database/Repository/ArchivingBeneficiaryRepository';
import { InvestmentsService } from 'Archiving/Adapter/Modules/InvestmentsService';
import { LegalEntitiesService } from 'Archiving/Adapter/Modules/LegalEntitiesService';
import { RegistrationService } from 'Archiving/Adapter/Modules/RegistrationService';
import { SharesAndDividendsService } from 'Archiving/Adapter/Modules/SharesAndDividendsService';
import { Archiving } from 'Archiving/index';
import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export class AdapterServiceProvider {
  private config: Archiving.Config;

  constructor(config: Archiving.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // database
    container
      .addAsValue(ArchivingDatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database))
      .addSingleton(ArchivingBeneficiaryRepository, [ArchivingDatabaseAdapterInstance, SimpleEventBus]);

    // modules
    container
      .addSingleton(LegalEntitiesService, ['LegalEntities'])
      .addSingleton(RegistrationService, ['Registration'])
      .addSingleton(InvestmentsService, ['Investments'])
      .addSingleton(SharesAndDividendsService, ['SharesAndDividends']);
  }
}
