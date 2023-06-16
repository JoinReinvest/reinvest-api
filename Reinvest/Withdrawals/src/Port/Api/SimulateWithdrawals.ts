import { UUID } from 'HKEKTypes/Generics';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import { GetFundsWithdrawalRequest } from 'Withdrawals/UseCase/GetFundsWithdrawalRequest';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class WithdrawalsController {
  private withdrawalsQuery: WithdrawalsQuery;
  private createWithdrawalFundsRequestUseCase: CreateWithdrawalFundsRequest;
  private getFundsWithdrawalRequestUseCase: GetFundsWithdrawalRequest;

  constructor(
    withdrawalsQuery: WithdrawalsQuery,
    createWithdrawalFundsRequestUseCase: CreateWithdrawalFundsRequest,
    getFundsWithdrawalRequestUseCase: GetFundsWithdrawalRequest,
  ) {
    this.withdrawalsQuery = withdrawalsQuery;
    this.createWithdrawalFundsRequestUseCase = createWithdrawalFundsRequestUseCase;
    this.getFundsWithdrawalRequestUseCase = getFundsWithdrawalRequestUseCase;
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

  async createWithdrawalFundsRequest(profileId: UUID, accountId: UUID) {
    return this.createWithdrawalFundsRequestUseCase.execute(profileId, accountId);
  }

  async getFundsWithdrawalRequest(profileId: UUID, accountId: UUID, id: UUID) {
    return this.getFundsWithdrawalRequestUseCase.execute(profileId, accountId, id);
  }
}
