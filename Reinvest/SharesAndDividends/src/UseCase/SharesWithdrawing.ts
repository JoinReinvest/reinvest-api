import { UUID } from 'HKEKTypes/Generics';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';

export class SharesWithdrawing {
  private sharesRepository: SharesRepository;
  private financialOperationRepository: FinancialOperationsRepository;
  private dividendsCalculationRepository: DividendsCalculationRepository;

  constructor(
    sharesRepository: SharesRepository,
    financialOperationRepository: FinancialOperationsRepository,
    dividendsCalculationRepository: DividendsCalculationRepository,
  ) {
    this.dividendsCalculationRepository = dividendsCalculationRepository;
    this.sharesRepository = sharesRepository;
    this.financialOperationRepository = financialOperationRepository;
  }

  static getClassName = () => 'SharesWithdrawing';

  async markAsWithdrawing(sharesIds: UUID[]): Promise<void> {
    try {
      const shares = await this.sharesRepository.getSharesByIds(sharesIds);

      if (!shares.length) {
        return;
      }

      for (const share of shares) {
        share.markAsWithdrawing();
      }

      await this.sharesRepository.store(shares);
      const dividends = await this.dividendsCalculationRepository.getDividendsBySharesId(sharesIds);

      if (dividends.length === 0) {
        return;
      }

      for (const dividend of dividends) {
        dividend.lockAwaitingDividend();
      }

      await this.dividendsCalculationRepository.updateCalculatedDividends(dividends);
    } catch (error) {
      console.error('[SharesWithdrawing]', sharesIds, error);
    }
  }

  async abortWithdrawing(sharesIds: UUID[]): Promise<void> {
    try {
      const shares = await this.sharesRepository.getSharesByIds(sharesIds);

      if (!shares.length) {
        return;
      }

      for (const share of shares) {
        share.abortWithdrawing();
      }

      await this.sharesRepository.store(shares);
      const dividends = await this.dividendsCalculationRepository.getDividendsBySharesId(sharesIds);

      if (dividends.length === 0) {
        return;
      }

      for (const dividend of dividends) {
        dividend.unlockAwaitingDividend();
      }

      await this.dividendsCalculationRepository.updateCalculatedDividends(dividends);
    } catch (error) {
      console.error('[SharesWithdrawing]', sharesIds, error);
    }
  }

  async completeWithdrawing(sharesIds: UUID[]): Promise<void> {
    try {
      const shares = await this.sharesRepository.getSharesByIds(sharesIds);

      if (!shares.length) {
        return;
      }

      for (const share of shares) {
        share.completeWithdrawing();
      }

      await this.sharesRepository.store(shares);
      const dividends = await this.dividendsCalculationRepository.getDividendsBySharesId(sharesIds);

      if (dividends.length === 0) {
        return;
      }

      for (const dividend of dividends) {
        dividend.revokeDividend();
      }

      await this.dividendsCalculationRepository.updateCalculatedDividends(dividends);
    } catch (error) {
      console.error('[SharesWithdrawing]', sharesIds, error);
    }
  }
}
