import { UUID } from 'HKEKTypes/Generics';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import AbortFundsWithdrawalRequest from 'Withdrawals/UseCase/AbortFundsWithdrawalRequest';
import CreateWithdrawal from 'Withdrawals/UseCase/CreateWithdrawal';
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
  private createWithdrawalUseCase: CreateWithdrawal;

  constructor(
    withdrawalsQuery: WithdrawalsQuery,
    createWithdrawalFundsRequestUseCase: CreateWithdrawalFundsRequest,
    getFundsWithdrawalRequestUseCase: GetFundsWithdrawalRequest,
    withdrawDividendUseCase: WithdrawDividend,
    abortFundsWithdrawalRequestUseCase: AbortFundsWithdrawalRequest,
    requestFundWithdrawalUseCase: RequestFundWithdrawal,
    createWithdrawalUseCase: CreateWithdrawal,
  ) {
    this.withdrawalsQuery = withdrawalsQuery;
    this.createWithdrawalFundsRequestUseCase = createWithdrawalFundsRequestUseCase;
    this.getFundsWithdrawalRequestUseCase = getFundsWithdrawalRequestUseCase;
    this.withdrawDividendUseCase = withdrawDividendUseCase;
    this.abortFundsWithdrawalRequestUseCase = abortFundsWithdrawalRequestUseCase;
    this.requestFundWithdrawalUseCase = requestFundWithdrawalUseCase;
    this.createWithdrawalUseCase = createWithdrawalUseCase;
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

  async createWithdrawalFundsRequest(profileId: UUID, accountId: UUID): Promise<WithdrawalError | null> {
    try {
      await this.createWithdrawalFundsRequestUseCase.execute(profileId, accountId);

      return null;
    } catch (error: any) {
      if (Object.values(WithdrawalError).includes(error.message)) {
        return error.message;
      }

      console.error(`Error creating withdrawal funds request for account ${accountId}`, error);

      return WithdrawalError.UNKNOWN_ERROR;
    }
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

  async prepareWithdrawalDocuments() {
    return this.createWithdrawalUseCase.execute();
  }

  async withdrawDividends(profileId: UUID, accountId: UUID, dividendIds: UUID[]): Promise<boolean> {
    const statuses = [];

    for (const dividendId of dividendIds) {
      statuses.push(await this.withdrawDividendUseCase.execute(profileId, accountId, dividendId));
    }

    return statuses.some(status => status === true);
  }
}
