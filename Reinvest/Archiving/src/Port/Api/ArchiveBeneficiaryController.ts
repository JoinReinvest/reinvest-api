import { ArchiveBeneficiary } from 'Archiving/UseCases/ArchiveBeneficiary';
import { InitArchivingBeneficiary } from 'Archiving/UseCases/InitArchivingBeneficiary';
import { UUID } from 'HKEKTypes/Generics';

export class ArchiveBeneficiaryController {
  private archiveBeneficiaryUseCase: ArchiveBeneficiary;
  private initArchiveBeneficiary: InitArchivingBeneficiary;

  static getClassName = (): string => 'ArchiveBeneficiaryController';

  constructor(initArchiveBeneficiary: InitArchivingBeneficiary, archiveBeneficiary: ArchiveBeneficiary) {
    this.initArchiveBeneficiary = initArchiveBeneficiary;
    this.archiveBeneficiaryUseCase = archiveBeneficiary;
  }

  async pushArchiveBeneficiaryProcess(profileId: UUID, accountId: UUID): Promise<boolean> {
    try {
      return await this.archiveBeneficiaryUseCase.execute(profileId, accountId);
    } catch (error: any) {
      console.log(`Can not archive beneficiary: ${profileId}/${accountId}`, error);

      return false;
    }
  }

  async initArchivingBeneficiary(profileId: UUID, accountId: UUID): Promise<boolean> {
    try {
      return await this.initArchiveBeneficiary.execute(profileId, accountId);
    } catch (error: any) {
      console.log(`Can not archive beneficiary: ${profileId}/${accountId}`, error);

      return false;
    }
  }
}
