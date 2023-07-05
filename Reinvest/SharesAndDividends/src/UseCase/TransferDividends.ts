import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';

export type TransferredDividends = {
  newDividendId: UUID;
  previousDividendId: UUID;
};

export class TransferDividends {
  static getClassName = () => 'TransferDividends';
  private notificationService: NotificationService;

  private dividendsCalculationRepository: DividendsCalculationRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(dividendsCalculationRepository: DividendsCalculationRepository, notificationService: NotificationService, idGenerator: IdGeneratorInterface) {
    this.notificationService = notificationService;
    this.dividendsCalculationRepository = dividendsCalculationRepository;
    this.idGenerator = idGenerator;
  }

  async execute(profileId: UUID, transferFromAccountId: UUID, transferToAccountId: UUID): Promise<TransferredDividends[]> {
    await this.dividendsCalculationRepository.transferCalculatedDividendsToAccount(transferFromAccountId, transferToAccountId);
    const unpaidDividends = await this.dividendsCalculationRepository.getUnpaidDividendsForAccount(transferFromAccountId);
    const transferredDividends = <TransferredDividends[]>[];
    const toStore = [];

    for (const dividend of unpaidDividends) {
      if (dividend.isTransferred()) {
        transferredDividends.push({
          previousDividendId: dividend.getTransferredFromId(),
          newDividendId: dividend.getId(),
        });
        continue;
      }

      const newDividendTransferId = this.idGenerator.createUuid();
      const currentDividendId = dividend.getId();
      const transferredDividend = dividend.transferDividend(newDividendTransferId, transferToAccountId);
      transferredDividends.push({
        previousDividendId: currentDividendId,
        newDividendId: newDividendTransferId,
      });

      toStore.push(transferredDividend);
      toStore.push(dividend);

      if (dividend.shouldSendNotification()) {
        await this.notificationService.transferDividendNotificationToAccount(profileId, transferToAccountId, dividend.getId());
      }
    }

    if (toStore.length > 0) {
      await this.dividendsCalculationRepository.transferInvestorDividends(toStore);
    }

    return transferredDividends;
  }
}
