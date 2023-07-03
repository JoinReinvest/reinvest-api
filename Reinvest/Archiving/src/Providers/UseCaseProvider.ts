import { ArchivingBeneficiaryRepository } from 'Archiving/Adapter/Database/Repository/ArchivingBeneficiaryRepository';
import { InvestmentsService } from 'Archiving/Adapter/Modules/InvestmentsService';
import { LegalEntitiesService } from 'Archiving/Adapter/Modules/LegalEntitiesService';
import { SharesAndDividendsService } from 'Archiving/Adapter/Modules/SharesAndDividendsService';
import { Archiving } from 'Archiving/index';
import { ArchiveBeneficiary } from 'Archiving/UseCases/ArchiveBeneficiary';
import { InitArchivingBeneficiary } from 'Archiving/UseCases/InitArchivingBeneficiary';
import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';

export class UseCaseProvider {
  private config: Archiving.Config;

  constructor(config: Archiving.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(InitArchivingBeneficiary, [LegalEntitiesService, ArchivingBeneficiaryRepository, IdGenerator]);
    container.addSingleton(ArchiveBeneficiary, [LegalEntitiesService, InvestmentsService, SharesAndDividendsService, ArchivingBeneficiaryRepository]);
  }
}
