import { ArchiveBeneficiaryController } from 'Archiving/Port/Api/ArchiveBeneficiaryController';
import { ContainerInterface } from 'Container/Container';

export type ArchivingApiType = {
  initArchivingBeneficiary: ArchiveBeneficiaryController['initArchivingBeneficiary'];
  pushArchiveBeneficiaryProcess: ArchiveBeneficiaryController['pushArchiveBeneficiaryProcess'];
};

export const ArchivingApi = (container: ContainerInterface): ArchivingApiType => ({
  pushArchiveBeneficiaryProcess: container.delegateTo(ArchiveBeneficiaryController, 'pushArchiveBeneficiaryProcess'),
  initArchivingBeneficiary: container.delegateTo(ArchiveBeneficiaryController, 'initArchivingBeneficiary'),
});
