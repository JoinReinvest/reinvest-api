import { ContainerInterface } from 'Container/Container';
import { MappingRegistryRepository } from 'Registration/Adapter/Database/Repository/MappingRegistryRepository';
import { LegalEntitiesService } from 'Registration/Adapter/Modules/LegalEntitiesService';
import { NorthCapitalSynchronizer } from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizer';
import { VertaloSynchronizer } from 'Registration/Adapter/Vertalo/VertaloSynchronizer';
import { Registration } from 'Registration/index';
import { SynchronizeCompany } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompany';
import { SynchronizeCompanyAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeCompanyAccount';
import { SynchronizeIndividualAccount } from 'Registration/IntegrationLogic/UseCase/SynchronizeIndividualAccount';
import { SynchronizeProfile } from 'Registration/IntegrationLogic/UseCase/SynchronizeProfile';
import { SynchronizeStakeholder } from 'Registration/IntegrationLogic/UseCase/SynchronizeStakeholder';

export class IntegrationServiceProvider {
  private config: Registration.Config;

  constructor(config: Registration.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(SynchronizeProfile, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer])
      .addSingleton(SynchronizeIndividualAccount, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer, VertaloSynchronizer])
      .addSingleton(SynchronizeCompanyAccount, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer, VertaloSynchronizer])
      .addSingleton(SynchronizeCompany, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer])
      .addSingleton(SynchronizeStakeholder, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer]);
  }
}
