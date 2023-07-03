import { ArchivingDatabaseAdapterInstance, DatabaseAdapterProvider } from 'Archiving/Adapter/Database/DatabaseAdapter';
import { Archiving } from 'Archiving/index';
import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { LegalEntitiesService } from 'Archiving/Adapter/Modules/LegalEntitiesService';
import { InvestmentsService } from 'Archiving/Adapter/Modules/InvestmentsService';

export class AdapterServiceProvider {
  private config: Archiving.Config;

  constructor(config: Archiving.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container));

    // database
    container.addAsValue(ArchivingDatabaseAdapterInstance, DatabaseAdapterProvider(this.config.database));
    // .addSingleton(ArchivingPdfPageRepository, [ArchivingDatabaseAdapterInstance, SimpleEventBus]);

    container.addSingleton(LegalEntitiesService, ['LegalEntities']).addSingleton(InvestmentsService, ['Investments']);
  }
}
