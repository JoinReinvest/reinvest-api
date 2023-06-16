import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class WithdrawalsController {
  private withdrawalsQuery: WithdrawalsQuery;

  constructor(withdrawalsQuery: WithdrawalsQuery) {
    this.withdrawalsQuery = withdrawalsQuery;
  }

  static getClassName = () => 'WithdrawalsController';

  async simulateWithdrawals(profileId: UUID, accountId: UUID) {
    const eligibleWithdrawalsState = await this.withdrawalsQuery.prepareEligibleWithdrawalsState(profileId, accountId);

    if (!eligibleWithdrawalsState) {
      return null;
    }

    return {
      canWithdraw: eligibleWithdrawalsState.canWithdraw(),
      eligibleForWithdrawal: eligibleWithdrawalsState.getEligibleForWithdrawalsAmount(),
      accountValue: eligibleWithdrawalsState.getAccountValueAmount(),
      penaltiesFee: eligibleWithdrawalsState.getPenaltiesFeeAmount(),
    };
  }
}
