import { UUID } from 'HKEKTypes/Generics';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { IncentiveRewardStatus } from 'SharesAndDividends/Domain/IncentiveReward';
import { InvestorDividendStatus } from 'SharesAndDividends/Domain/InvestorDividend';

export class DividendWithdrawing {
  private dividendsRepository: DividendsRepository;

  constructor(dividendsRepository: DividendsRepository) {
    this.dividendsRepository = dividendsRepository;
  }

  static getClassName = () => 'DividendWithdrawing';

  async markAsWithdrawing(dividendsIds: UUID[]): Promise<void> {
    await this.dividendsRepository.markIncentiveDividendsAs(IncentiveRewardStatus.WITHDRAWING, dividendsIds, IncentiveRewardStatus.AWAITING_ACTION);
    await this.dividendsRepository.markDividendsAs(InvestorDividendStatus.WITHDRAWING, dividendsIds, InvestorDividendStatus.AWAITING_ACTION);
  }

  async abortWithdrawing(dividendsIds: UUID[]): Promise<void> {
    await this.dividendsRepository.markIncentiveDividendsAs(IncentiveRewardStatus.AWAITING_ACTION, dividendsIds, IncentiveRewardStatus.WITHDRAWING);
    await this.dividendsRepository.markDividendsAs(InvestorDividendStatus.AWAITING_ACTION, dividendsIds, InvestorDividendStatus.WITHDRAWING);
  }

  async completeWithdrawing(dividendsIds: UUID[]): Promise<void> {
    await this.dividendsRepository.markIncentiveDividendsAs(IncentiveRewardStatus.WITHDRAWN, dividendsIds, IncentiveRewardStatus.WITHDRAWING);
    await this.dividendsRepository.markDividendsAs(InvestorDividendStatus.WITHDRAWN, dividendsIds, InvestorDividendStatus.WITHDRAWING);
  }
}
