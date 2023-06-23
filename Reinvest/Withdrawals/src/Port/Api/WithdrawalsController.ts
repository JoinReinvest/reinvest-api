import { UUID } from 'HKEKTypes/Generics';
import AbortFundsWithdrawalRequest from 'Withdrawals/UseCase/AbortFundsWithdrawalRequest';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import { GetFundsWithdrawalRequest } from 'Withdrawals/UseCase/GetFundsWithdrawalRequest';
import { RequestFundWithdrawal } from 'Withdrawals/UseCase/RequestFundWithdrawal';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';

export class WithdrawalsController {
  private withdrawalsQuery: WithdrawalsQuery;
  private createWithdrawalFundsRequestUseCase: CreateWithdrawalFundsRequest;
  private getFundsWithdrawalRequestUseCase: GetFundsWithdrawalRequest;
  private withdrawDividendUseCase: WithdrawDividend;
  private abortFundsWithdrawalRequestUseCase: AbortFundsWithdrawalRequest;
  private requestFundWithdrawalUseCase: RequestFundWithdrawal;

  constructor(
    withdrawalsQuery: WithdrawalsQuery,
    createWithdrawalFundsRequestUseCase: CreateWithdrawalFundsRequest,
    getFundsWithdrawalRequestUseCase: GetFundsWithdrawalRequest,
    withdrawDividendUseCase: WithdrawDividend,
    abortFundsWithdrawalRequestUseCase: AbortFundsWithdrawalRequest,
    requestFundWithdrawalUseCase: RequestFundWithdrawal,
  ) {
    this.withdrawalsQuery = withdrawalsQuery;
    this.createWithdrawalFundsRequestUseCase = createWithdrawalFundsRequestUseCase;
    this.getFundsWithdrawalRequestUseCase = getFundsWithdrawalRequestUseCase;
    this.withdrawDividendUseCase = withdrawDividendUseCase;
    this.abortFundsWithdrawalRequestUseCase = abortFundsWithdrawalRequestUseCase;
    this.requestFundWithdrawalUseCase = requestFundWithdrawalUseCase;
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

  async getFundsWithdrawalRequest(profileId: UUID, accountId: UUID) {
    return this.getFundsWithdrawalRequestUseCase.execute(profileId, accountId);
  }

  async abortFundsWithdrawalRequest(profileId: UUID, accountId: UUID) {
    return this.abortFundsWithdrawalRequestUseCase.execute(profileId, accountId);
  }

  async requestFundWithdrawal(profileId: UUID, accountId: UUID) {
    return this.requestFundWithdrawalUseCase.execute(profileId, accountId);
  }

  async withdrawDividends(profileId: UUID, accountId: UUID, dividendIds: UUID[]): Promise<boolean> {
    const statuses = [];

    for (const dividendId of dividendIds) {
      statuses.push(await this.withdrawDividendUseCase.execute(profileId, accountId, dividendId));
    }

    return statuses.some(status => status === true);
  }
}
