import { InitArchivingBeneficiary } from 'Archiving/UseCases/InitArchivingBeneficiary';
import { UUID } from 'HKEKTypes/Generics';

export class ArchiveBeneficiaryController {
  private initArchivingBeneficiaryUseCase: InitArchivingBeneficiary;

  constructor(initArchivingBeneficiaryUseCase: InitArchivingBeneficiary) {
    this.initArchivingBeneficiaryUseCase = initArchivingBeneficiaryUseCase;
  }

  async archiveBeneficiary(profileId: UUID, accountId: UUID) {
    try {
      await this.initArchivingBeneficiaryUseCase.execute(profileId, accountId);
    } catch (error: any) {
      console.log(`Can not archive beneficiary: ${profileId}/${accountId}`, error);
    }
  }
}
