import { UUID } from 'HKEKTypes/Generics';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { EligibleWithdrawalsState } from 'Withdrawals/Domain/EligibleWithdrawalsState';
import { AwaitingDividend, SettledShares, WithdrawalsCalculator } from 'Withdrawals/Domain/WithdrawalsCalculator';

export type CurrentAccountState = {
  areThereNotSettledShares: boolean;
  awaitingDividends: AwaitingDividend[];
  settledShares: SettledShares[];
};

export class WithdrawalsQuery {
  private sharesAndDividendsService: SharesAndDividendsService;

  constructor(sharesAndDividendsService: SharesAndDividendsService) {
    this.sharesAndDividendsService = sharesAndDividendsService;
  }

  static getClassName = () => 'WithdrawalsQuery';

  async prepareEligibleWithdrawalsState(profileId: UUID, accountId: UUID): Promise<EligibleWithdrawalsState | null> {
    try {
      const accountState = await this.sharesAndDividendsService.getAccountState(profileId, accountId);
      const { settledShares, awaitingDividends, areThereNotSettledShares } = accountState;

      const eligibleWithdrawals = WithdrawalsCalculator.calculateEligibleWithdrawals(settledShares, awaitingDividends);

      return new EligibleWithdrawalsState(awaitingDividends, eligibleWithdrawals, settledShares, areThereNotSettledShares);
    } catch (error: any) {
      console.log(`Calculating eligible withdrawals for account ${accountId} failed`, error);

      return null;
    }
  }
}
