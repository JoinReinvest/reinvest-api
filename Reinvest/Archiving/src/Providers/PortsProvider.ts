import { Archiving } from 'Archiving/index';
import { ArchiveBeneficiaryController } from 'Archiving/Port/Api/ArchiveBeneficiaryController';
import { ArchiveBeneficiary } from 'Archiving/UseCases/ArchiveBeneficiary';
import { InitArchivingBeneficiary } from 'Archiving/UseCases/InitArchivingBeneficiary';
import { ContainerInterface } from 'Container/Container';

export class PortsProvider {
  private config: Archiving.Config;

  constructor(config: Archiving.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(ArchiveBeneficiaryController, [InitArchivingBeneficiary, ArchiveBeneficiary]);
  }
}
