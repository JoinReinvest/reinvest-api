import { ArchivingBeneficiaryRepository } from 'Archiving/Adapter/Database/Repository/ArchivingBeneficiaryRepository';
import { LegalEntitiesService } from 'Archiving/Adapter/Modules/LegalEntitiesService';
import { UUID } from 'HKEKTypes/Generics';

export class InitArchivingBeneficiary {
  private legalEntitiesService: LegalEntitiesService;
  private archivingRepository: ArchivingBeneficiaryRepository;

  constructor(legalEntitiesService: LegalEntitiesService, archivingRepository: ArchivingBeneficiaryRepository) {
    this.legalEntitiesService = legalEntitiesService;
    this.archivingRepository = archivingRepository;
  }

  async execute(profileId: UUID, accountId: UUID): Promise<void> {}
}
