import { ArchivingBeneficiaryRepository } from 'Archiving/Adapter/Database/Repository/ArchivingBeneficiaryRepository';
import { InvestmentsService } from 'Archiving/Adapter/Modules/InvestmentsService';
import { LegalEntitiesService } from 'Archiving/Adapter/Modules/LegalEntitiesService';
import { SharesAndDividendsService } from 'Archiving/Adapter/Modules/SharesAndDividendsService';
import { UUID } from 'HKEKTypes/Generics';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { ArchivedBeneficiary } from 'Archiving/Domain/ArchivedBeneficiary';
import { RegistrationService } from 'Archiving/Adapter/Modules/RegistrationService';

export class ArchiveBeneficiary {
  static getClassName = (): string => 'ArchiveBeneficiary';
  private registrationService: RegistrationService;
  private legalEntitiesService: LegalEntitiesService;
  private sharesAndDividendsService: SharesAndDividendsService;
  private investmentsService: InvestmentsService;
  private archivingRepository: ArchivingBeneficiaryRepository;

  constructor(
    legalEntitiesService: LegalEntitiesService,
    investmentsService: InvestmentsService,
    sharesAndDividendsService: SharesAndDividendsService,
    archivingRepository: ArchivingBeneficiaryRepository,
    registrationService: RegistrationService,
  ) {
    this.registrationService = registrationService;
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.investmentsService = investmentsService;
    this.legalEntitiesService = legalEntitiesService;
    this.archivingRepository = archivingRepository;
  }

  async execute(profileId: UUID, accountId: UUID): Promise<boolean> {
    try {
      const beneficiary: ArchivedBeneficiary | null = await this.archivingRepository.getBy(profileId, accountId);

      if (!beneficiary) {
        throw new Error('Archiving Beneficiary not started');
      }

      if (!beneficiary.isArchived()) {
        await this.legalEntitiesService.archiveBeneficiary(profileId, accountId);
        beneficiary.setAccountAsArchived();
        await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.isVertaloConfigurationSet()) {
        const vertaloConfiguration = await this.registrationService.getVertaloConfigurationForAccount(profileId, accountId);
        beneficiary.setVertaloConfiguration(vertaloConfiguration);
        await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.areInvestmentsTransferred()) {
        const transferredInvestments = await this.investmentsService.transferInvestments(profileId, accountId, beneficiary.getParentId());
        beneficiary.setTransferredInvestments(transferredInvestments);
        await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.areDividendsTransferred()) {
        const transferredDividends = await this.sharesAndDividendsService.transferDividends(profileId, accountId, beneficiary.getParentId());
        beneficiary.setTransferredDividends(transferredDividends);
        await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.areSharesTransferred()) {
        const transferredShares = await this.sharesAndDividendsService.transferShares(
          profileId,
          accountId,
          beneficiary.getParentId(),
          beneficiary.getTransferredInvestments(),
          beneficiary.getTransferredDividends(),
        );
        beneficiary.setTransferredShares(transferredShares);
        await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.isRecurringInvestmentDisabled()) {
        await this.investmentsService.disableRecurringInvestment(profileId, accountId);
        beneficiary.setRecurringInvestmentDisabled();
        await this.archivingRepository.store(beneficiary);
      }

      if (!beneficiary.isCompleted()) {
        const events = [
          storeEventCommand(profileId, 'ArchivingBeneficiaryCompleted', {
            accountId,
            ...beneficiary.getTransfersStats(),
          }),
          storeEventCommand(profileId, 'TransferringBeneficiaryToParentCompleted', {
            accountId: beneficiary.getParentId(),
            ...beneficiary.getTransfersStats(),
          }),
        ];

        beneficiary.setCompleted();
        await this.archivingRepository.store(beneficiary, events);
      }

      return true;
    } catch (error: any) {
      console.log(`Can not archive beneficiary: ${profileId}/${accountId}`, error);

      return false;
    }
  }
}
