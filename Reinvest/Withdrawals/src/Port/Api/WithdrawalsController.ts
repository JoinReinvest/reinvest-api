import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';

export class WithdrawalsController {
  private withdrawalsQuery: WithdrawalsQuery;
  private withdrawDividendUseCase: WithdrawDividend;

  constructor(withdrawalsQuery: WithdrawalsQuery, withdrawDividendUseCase: WithdrawDividend) {
    this.withdrawalsQuery = withdrawalsQuery;
    this.withdrawDividendUseCase = withdrawDividendUseCase;
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

  async withdrawDividends(profileId: UUID, accountId: UUID, dividendIds: UUID[]): Promise<boolean> {
    const statuses = [];

    for (const dividendId of dividendIds) {
      statuses.push(await this.withdrawDividendUseCase.execute(profileId, accountId, dividendId));
    }

    return statuses.some(status => status === true);
  }
}
