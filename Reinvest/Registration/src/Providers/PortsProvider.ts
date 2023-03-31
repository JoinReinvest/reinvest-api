import { ContainerInterface } from 'Container/Container';
import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { NorthCapitalDocumentsSynchronizationRepository } from 'Registration/Adapter/Database/Repository/NorthCapitalDocumentsSynchronizationRepository';
import { NorthCapitalSynchronizer } from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizer';
import { Registration } from 'Registration/index';
import { SynchronizeIndividualAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount';
import { SynchronizeProfile } from 'Registration/IntegrationLogic/UseCase/SynchronizeProfile';
import { NorthCapitalDocumentSynchronizationController } from 'Registration/Port/Api/NorthCapitalDocumentSynchronizationController';
import { NorthCapitalDocumentSynchronizationQuery } from 'Registration/Port/Api/NorthCapitalDocumentSynchronizationQuery';
import { IndividualAccountOpenedEventHandler } from 'Registration/Port/Queue/EventHandler/IndividualAccountOpenedEventHandler';
import { ProfileCompletedEventHandler } from 'Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler';

export class PortsProvider {
  private config: Registration.Config;

  constructor(config: Registration.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container
      .addSingleton(NorthCapitalDocumentSynchronizationQuery, [NorthCapitalDocumentsSynchronizationRepository])
      .addSingleton(NorthCapitalDocumentSynchronizationController, [NorthCapitalSynchronizer]);

    // event handlers
    container
      .addSingleton(ProfileCompletedEventHandler, [MappingRegistryRepository, SynchronizeProfile])
      .addSingleton(IndividualAccountOpenedEventHandler, [MappingRegistryRepository, SynchronizeIndividualAccount]);
  }
}
