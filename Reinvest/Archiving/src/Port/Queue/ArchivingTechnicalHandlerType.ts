import { ArchiveBeneficiaryEventHandler } from 'Archiving/Port/Queue/EventHandler/ArchiveBeneficiaryEventHandler';
import { ContainerInterface } from 'Container/Container';

export type ArchivingTechnicalHandlerType = {
  ArchiveBeneficiary: ArchiveBeneficiaryEventHandler['handle'];
};

export const archivingTechnicalHandler = (container: ContainerInterface): ArchivingTechnicalHandlerType => ({
  ArchiveBeneficiary: container.delegateTo(ArchiveBeneficiaryEventHandler, 'handle'),
});
