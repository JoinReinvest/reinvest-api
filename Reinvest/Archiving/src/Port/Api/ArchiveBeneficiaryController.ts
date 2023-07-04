import { ArchivingBeneficiaryIds, ArchivingBeneficiaryRepository } from 'Archiving/Adapter/Database/Repository/ArchivingBeneficiaryRepository';
import { ArchiveBeneficiary } from 'Archiving/UseCases/ArchiveBeneficiary';
import { InitArchivingBeneficiary } from 'Archiving/UseCases/InitArchivingBeneficiary';
import { UUID } from 'HKEKTypes/Generics';

export class ArchiveBeneficiaryController {
  private archiveBeneficiaryUseCase: ArchiveBeneficiary;
  private initArchiveBeneficiary: InitArchivingBeneficiary;

  static getClassName = (): string => 'ArchiveBeneficiaryController';
  private archivingRepository: ArchivingBeneficiaryRepository;

  constructor(initArchiveBeneficiary: InitArchivingBeneficiary, archiveBeneficiary: ArchiveBeneficiary, archivingRepository: ArchivingBeneficiaryRepository) {
    this.initArchiveBeneficiary = initArchiveBeneficiary;
    this.archiveBeneficiaryUseCase = archiveBeneficiary;
    this.archivingRepository = archivingRepository;
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

  async getPendingBeneficiaryArchivingProcesses(): Promise<ArchivingBeneficiaryIds[]> {
    return this.archivingRepository.getPendingArchivingBeneficiaries();
  }
}
