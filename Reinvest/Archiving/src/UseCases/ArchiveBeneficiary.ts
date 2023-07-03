import { ArchivingBeneficiaryRepository } from 'Archiving/Adapter/Database/Repository/ArchivingBeneficiaryRepository';
import { InvestmentsService } from 'Archiving/Adapter/Modules/InvestmentsService';
import { LegalEntitiesService } from 'Archiving/Adapter/Modules/LegalEntitiesService';
import { SharesAndDividendsService } from 'Archiving/Adapter/Modules/SharesAndDividendsService';
import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';

export class ArchiveBeneficiary {
  private legalEntitiesService: LegalEntitiesService;
  private investmentsService: InvestmentsService;
  private archivingRepository: ArchivingBeneficiaryRepository;
  static getClassName = (): string => 'ArchiveBeneficiary';
  private idGenerator: IdGeneratorInterface;

  constructor(
    legalEntitiesService: LegalEntitiesService,
    investmentsService: InvestmentsService,
    sharesAndDividendsService: SharesAndDividendsService,
    archivingRepository: ArchivingBeneficiaryRepository,
    idGenerator: IdGeneratorInterface,
  ) {
    this.investmentsService = investmentsService;
    this.legalEntitiesService = legalEntitiesService;
    this.archivingRepository = archivingRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: UUID, accountId: UUID): Promise<boolean> {
    try {
      const beneficiary = await this.archivingRepository.getBy(profileId, accountId);

      if (!beneficiary) {
        throw new Error('Archiving Beneficiary not started');
      }

      if (!beneficiary.isArchived()) {
        await this.legalEntitiesService.archiveBeneficiary(profileId, accountId);
        beneficiary.setAccountAsArchived();
        await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.areInvestmentsTransferred()) {
        // const transferredInvestments = await this.investmentsService.transferInvestments(profileId, accountId, beneficiary.getParentId());
        // beneficiary.setTransferredInvestments(transferredInvestments);
      }

      if (!beneficiary.areSharesTransferred()) {
        // const transferredShares = await this.sharesAndDividendsService.transferShares(profileId, accountId, beneficiary.getParentId());
        // beneficiary.setTransferredShares(transferredShares);
        // await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.areDividendsTransferred()) {
        // const transferredDividends = await this.sharesAndDividendsService.transferDividends(profileId, accountId, beneficiary.getParentId());
        // beneficiary.setTransferredDividends(transferredDividends);
        // await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.isRecurringInvestmentDisabled()) {
        // await this.investmentsService.disableRecurringInvestment(profileId, accountId);
      }

      return true;
    } catch (error: any) {
      console.log(`Can not archive beneficiary: ${profileId}/${accountId}`, error);

      return false;
    }
  }
}
