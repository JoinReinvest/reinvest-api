import { ArchiveBeneficiaryController } from 'Archiving/Port/Api/ArchiveBeneficiaryController';
import { ContainerInterface } from 'Container/Container';

export type ArchivingApiType = {
  getPendingBeneficiaryArchivingProcesses: ArchiveBeneficiaryController['getPendingBeneficiaryArchivingProcesses'];
  initArchivingBeneficiary: ArchiveBeneficiaryController['initArchivingBeneficiary'];
  pushArchiveBeneficiaryProcess: ArchiveBeneficiaryController['pushArchiveBeneficiaryProcess'];
};

export const ArchivingApi = (container: ContainerInterface): ArchivingApiType => ({
  pushArchiveBeneficiaryProcess: container.delegateTo(ArchiveBeneficiaryController, 'pushArchiveBeneficiaryProcess'),
  initArchivingBeneficiary: container.delegateTo(ArchiveBeneficiaryController, 'initArchivingBeneficiary'),
  getPendingBeneficiaryArchivingProcesses: container.delegateTo(ArchiveBeneficiaryController, 'getPendingBeneficiaryArchivingProcesses'),
});
