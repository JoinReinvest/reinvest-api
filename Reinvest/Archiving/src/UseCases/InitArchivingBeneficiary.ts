import { ArchivingBeneficiaryRepository } from 'Archiving/Adapter/Database/Repository/ArchivingBeneficiaryRepository';
import { LegalEntitiesService } from 'Archiving/Adapter/Modules/LegalEntitiesService';
import { WithdrawalsService } from 'Archiving/Adapter/Modules/WithdrawalsService';
import { ArchivedBeneficiary } from 'Archiving/Domain/ArchivedBeneficiary';
import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class InitArchivingBeneficiary {
  static getClassName = (): string => 'InitArchivingBeneficiary';
  private legalEntitiesService: LegalEntitiesService;
  private archivingRepository: ArchivingBeneficiaryRepository;
  private idGenerator: IdGeneratorInterface;
  private withdrawalsService: WithdrawalsService;

  constructor(
    legalEntitiesService: LegalEntitiesService,
    archivingRepository: ArchivingBeneficiaryRepository,
    idGenerator: IdGeneratorInterface,
    withdrawalsService: WithdrawalsService,
  ) {
    this.legalEntitiesService = legalEntitiesService;
    this.archivingRepository = archivingRepository;
    this.idGenerator = idGenerator;
    this.withdrawalsService = withdrawalsService;
  }

  async execute(profileId: UUID, accountId: UUID): Promise<boolean> {
    try {
      if (await this.withdrawalsService.hasPendingWithdrawal(profileId, accountId)) {
        throw new Error('Archiving Beneficiary has pending withdrawal');
      }

      let beneficiary = await this.archivingRepository.getBy(profileId, accountId);

      if (beneficiary) {
        throw new Error('Archiving Beneficiary already started');
      }

      const beneficiaryData = await this.legalEntitiesService.getBeneficiary(profileId, accountId);

      if (!beneficiaryData) {
        return false;
      }

      const { label, parentId } = beneficiaryData;
      const id = this.idGenerator.createUuid();
      beneficiary = ArchivedBeneficiary.create(id, profileId, accountId, parentId, label);

      await this.archivingRepository.store(beneficiary, [
        storeEventCommand(profileId, 'ArchivingBeneficiaryStarted', {
          label,
          beneficiaryId: accountId,
          accountId: parentId,
        }),
        {
          kind: 'ArchiveBeneficiary',
          id,
          data: {
            profileId,
            accountId,
          },
        },
      ]);

      return true;
    } catch (error: any) {
      console.log(`Can not archive beneficiary: ${profileId}/${accountId}`, error);

      return false;
    }
  }
}
