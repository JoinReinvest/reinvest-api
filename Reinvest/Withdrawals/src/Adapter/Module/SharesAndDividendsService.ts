import { UUID } from "HKEKTypes/Generics";
import { DateTime } from "Money/DateTime";
import { Money } from "Money/Money";
import { SharesAndDividends } from "SharesAndDividends/index";
import { DividendDetails } from "Withdrawals/Domain/DividendWithdrawalRequest";
import { CurrentAccountState } from "Withdrawals/UseCase/WithdrawalsQuery";

/**
 * SharesAndDividends Module ACL
 */
export class SharesAndDividendsService {
  private sharesAndDividendsModule: SharesAndDividends.Main;

  constructor(sharesAndDividendsModule: SharesAndDividends.Main) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  static getClassName = () => 'SharesAndDividendsService';

  async getAccountState(profileId: UUID, accountId: UUID): Promise<CurrentAccountState> {
    const accountState = await this.sharesAndDividendsModule.api().getAccountState(profileId, accountId);

    if (!accountState) {
      throw new Error('Account state not found');
    }

    const { settledShares, awaitingDividends, areThereNotSettledShares } = accountState;

    return {
      settledShares: settledShares.map(settledShare => ({
        id: settledShare.id,
        numberOfShares: settledShare.numberOfShares,
        transactionDate: DateTime.from(settledShare.transactionDate),
        unitPrice: Money.lowPrecision(settledShare.unitPrice),
        currentNavPerShare: Money.lowPrecision(settledShare.currentNavPerShare),
      })),
      awaitingDividends: awaitingDividends.map(awaitingDividend => ({
        id: awaitingDividend.id,
        totalDividendAmount: Money.lowPrecision(awaitingDividend.totalDividendAmount),
        totalFeeAmount: Money.lowPrecision(awaitingDividend.totalFeeAmount),
      })),
      areThereNotSettledShares,
    };
  }

  async findDividend(profileId: UUID, dividendId: UUID): Promise<DividendDetails> {
    const dividend = await this.sharesAndDividendsModule.api().getDividend(profileId, dividendId);

    if (!dividend) {
      throw new Error('Dividend not found');
    }

    if (dividend.status !== 'PENDING') {
      throw new Error('Dividend is already actioned');
    }

    const {
      amount: { value },
      id,
    } = dividend;

    return {
      amount: Money.lowPrecision(value),
      id,
    };
  }

  async markDividendAsWithdrew(profileId: UUID, dividendId: UUID): Promise<void> {
    await this.sharesAndDividendsModule.api().markDividendAsWithdrew(profileId, dividendId);
  }

  async sharesWithdrawing(sharesIds: UUID[]): Promise<void> {
    await this.sharesAndDividendsModule.api().setSharesWithdrawing(sharesIds);
  }

  async dividendsWithdrawing(dividendsIds: UUID[]): Promise<void> {
    await this.sharesAndDividendsModule.api().markDividendAsWithdrawing(dividendsIds);
  }

  async abortSharesWithdrawing(sharesIds: UUID[]): Promise<void> {
    await this.sharesAndDividendsModule.api().abortSharesWithdrawing(sharesIds);
  }

  async abortDividendsWithdrawing(dividendsIds: UUID[]): Promise<void> {
    await this.sharesAndDividendsModule.api().abortDividendsWithdrawing(dividendsIds);
  }

  async completeSharesWithdrawing(sharesIds: UUID[]): Promise<void> {
    await this.sharesAndDividendsModule.api().completeSharesWithdrawing(sharesIds);
  }

  async completeDividendsWithdrawing(dividendsIds: UUID[]): Promise<void> {
    await this.sharesAndDividendsModule.api().completeDividendsWithdrawing(dividendsIds);
  }
}
