import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { CurrentAccountState } from 'Withdrawals/UseCase/WithdrawalsQuery';

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
}
