import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';
import { InvestorDividendsCalculator } from 'SharesAndDividends/Domain/CalculatingDividends/InvestorDividendsCalculator';
import { InvestorDividend } from 'SharesAndDividends/Domain/InvestorDividend';

export class DistributeDividends {
  private dividendsCalculationRepository: DividendsCalculationRepository;
  private idGenerator: IdGeneratorInterface;
  private sharesRepository: SharesRepository;
  private transactionAdapter: TransactionalAdapter<SharesAndDividendsDatabase>;
  private notificationService: NotificationService;

  constructor(
    idGenerator: IdGeneratorInterface,
    dividendsCalculationRepository: DividendsCalculationRepository,
    sharesRepository: SharesRepository,
    transactionAdapter: TransactionalAdapter<SharesAndDividendsDatabase>,
    notificationService: NotificationService,
  ) {
    this.idGenerator = idGenerator;
    this.dividendsCalculationRepository = dividendsCalculationRepository;
    this.sharesRepository = sharesRepository;
    this.transactionAdapter = transactionAdapter;
    this.notificationService = notificationService;
  }

  static getClassName = () => 'DistributeDividends';

  async execute(distributionId: UUID, accountIds: UUID[]): Promise<void> {
    console.log('[DistributeDividends] execute', { distributionId, accountIds });
    const dividendDistribution = await this.dividendsCalculationRepository.getDividendDistributionById(distributionId);

    if (!dividendDistribution) {
      throw new Error(`[DistributeDividends] Dividend distribution not found: ${distributionId}`);
    }

    const distributeToDate = dividendDistribution.getDistributeToDate();

    for (const accountId of accountIds) {
      await this.distributeDividendForAccount(accountId, distributionId, distributeToDate);
    }

    return;
  }

  private async distributeDividendForAccount(accountId: UUID, distributionId: UUID, distributeToDate: DateTime): Promise<void> {
    const sharesCost = await this.sharesRepository.getCostOfSharesOwned(accountId, distributeToDate);
    const partialDividends = await this.dividendsCalculationRepository.getDividendsCalculationForAccount(accountId, distributeToDate);

    const { calculatedDividendsList, totalDividendAmount, totalFeeAmount } = InvestorDividendsCalculator.calculateDividend(sharesCost, partialDividends);
    const profileId = partialDividends[0]!.getProfileId();

    const investorDividendId = this.idGenerator.createUuid();

    const investorDividend = InvestorDividend.create(
      investorDividendId,
      profileId,
      accountId,
      distributionId,
      totalDividendAmount,
      totalFeeAmount,
      calculatedDividendsList,
    );

    const dividendWithNoCoveredFee = await this.dividendsCalculationRepository.getDividendWithNoCoveredFee(accountId);

    if (dividendWithNoCoveredFee) {
      const extraFeeToCover = dividendWithNoCoveredFee.feeIsCoveredByDividend(investorDividendId);
      investorDividend.coverExtraFee(extraFeeToCover);
    }

    partialDividends.map(dividend => dividend.markAsDistributed());

    await this.transactionAdapter.transaction(`[Dividend distribution: ${distributionId}] Create new dividend update for account ${accountId}`, async () => {
      await this.dividendsCalculationRepository.storeInvestorDividend(investorDividend);

      if (dividendWithNoCoveredFee) {
        await this.dividendsCalculationRepository.storeInvestorDividend(dividendWithNoCoveredFee);
      }

      await this.dividendsCalculationRepository.updateCalculatedDividends(partialDividends);

      if (investorDividend.shouldSendNotification()) {
        await this.notificationService.notifyDividendUpdate(investorDividend);
      }
    });
  }
}
