import { ContainerInterface } from 'Container/Container';
import { Verification } from 'Verification/index';

export class IntegrationServiceProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // container
    //   .addSingleton(SynchronizeProfile, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer])
    //   .addSingleton(SynchronizeIndividualAccount, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer, VertaloSynchronizer])
    //   .addSingleton(SynchronizeCompanyAccount, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer, VertaloSynchronizer])
    //   .addSingleton(SynchronizeCompany, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer])
    //   .addSingleton(SynchronizeStakeholder, [MappingRegistryRepository, LegalEntitiesService, NorthCapitalSynchronizer]);
  }
}
