import { Pagination, UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { DividendRequestView } from 'Withdrawals/Domain/DividendWithdrawalRequest';
import { WithdrawalError, WithdrawalRequestView } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { WithdrawalView } from 'Withdrawals/Domain/Withdrawal';
import AbortFundsWithdrawalRequest from 'Withdrawals/UseCase/AbortFundsWithdrawalRequest';
import AcceptWithdrawalRequests from 'Withdrawals/UseCase/AcceptWithdrawalRequests';
import CreateWithdrawal from 'Withdrawals/UseCase/CreateWithdrawal';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import { FundsWithdrawalRequestsQuery } from 'Withdrawals/UseCase/FundsWithdrawalRequestsQuery';
import { MarkWithdrawalAsCompleted } from 'Withdrawals/UseCase/MarkWithdrawalAsCompleted';
import { PushWithdrawalsDocumentCreation } from 'Withdrawals/UseCase/PushWithdrawalsDocumentCreation';
import RejectWithdrawalRequests from 'Withdrawals/UseCase/RejectWithdrawalRequests';
import { RequestFundWithdrawal } from 'Withdrawals/UseCase/RequestFundWithdrawal';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';

export class WithdrawalsController {
  private withdrawalsQuery: WithdrawalsQuery;
  private createWithdrawalFundsRequestUseCase: CreateWithdrawalFundsRequest;
  private withdrawalRequestsQuery: FundsWithdrawalRequestsQuery;
  private withdrawDividendUseCase: WithdrawDividend;
  private abortFundsWithdrawalRequestUseCase: AbortFundsWithdrawalRequest;
  private requestFundWithdrawalUseCase: RequestFundWithdrawal;
  private createWithdrawalUseCase: CreateWithdrawal;
  private acceptWithdrawalRequestsUseCase: AcceptWithdrawalRequests;
  private rejectWithdrawalRequestsUseCase: RejectWithdrawalRequests;
  private pushWithdrawalsDocumentCreationUseCase: PushWithdrawalsDocumentCreation;
  private markWithdrawalAsCompletedUseCase: MarkWithdrawalAsCompleted;

  constructor(
    withdrawalsQuery: WithdrawalsQuery,
    createWithdrawalFundsRequestUseCase: CreateWithdrawalFundsRequest,
    fundsWithdrawalRequestsQuery: FundsWithdrawalRequestsQuery,
    withdrawDividendUseCase: WithdrawDividend,
    abortFundsWithdrawalRequestUseCase: AbortFundsWithdrawalRequest,
    requestFundWithdrawalUseCase: RequestFundWithdrawal,
    createWithdrawalUseCase: CreateWithdrawal,
    acceptWithdrawalRequestsUseCase: AcceptWithdrawalRequests,
    rejectWithdrawalRequestsUseCase: RejectWithdrawalRequests,
    pushWithdrawalsDocumentCreationUseCase: PushWithdrawalsDocumentCreation,
    markWithdrawalAsCompletedUseCase: MarkWithdrawalAsCompleted,
  ) {
    this.withdrawalsQuery = withdrawalsQuery;
    this.createWithdrawalFundsRequestUseCase = createWithdrawalFundsRequestUseCase;
    this.withdrawalRequestsQuery = fundsWithdrawalRequestsQuery;
    this.withdrawDividendUseCase = withdrawDividendUseCase;
    this.abortFundsWithdrawalRequestUseCase = abortFundsWithdrawalRequestUseCase;
    this.requestFundWithdrawalUseCase = requestFundWithdrawalUseCase;
    this.createWithdrawalUseCase = createWithdrawalUseCase;
    this.acceptWithdrawalRequestsUseCase = acceptWithdrawalRequestsUseCase;
    this.rejectWithdrawalRequestsUseCase = rejectWithdrawalRequestsUseCase;
    this.pushWithdrawalsDocumentCreationUseCase = pushWithdrawalsDocumentCreationUseCase;
    this.markWithdrawalAsCompletedUseCase = markWithdrawalAsCompletedUseCase;
  }

  static getClassName = () => 'WithdrawalsController';

  async simulateWithdrawals(profileId: UUID, accountId: UUID) {
    const eligibleWithdrawalsState = await this.withdrawalsQuery.prepareEligibleWithdrawalsState(profileId, accountId);

    if (!eligibleWithdrawalsState) {
      const zero = Money.zero();
      const amount = {
        value: zero.getAmount(),
        formatted: zero.getFormattedAmount(),
      };

      return {
        canWithdraw: false,
        eligibleForWithdrawal: amount,
        accountValue: amount,
        penaltiesFee: amount,
      };
    }

    return {
      canWithdraw: eligibleWithdrawalsState.canWithdraw(),
      eligibleForWithdrawal: eligibleWithdrawalsState.getEligibleForWithdrawalsAmount(),
      accountValue: eligibleWithdrawalsState.getAccountValueAmount(),
      penaltiesFee: eligibleWithdrawalsState.getPenaltiesFeeAmount(),
    };
  }

  async createWithdrawalFundsRequest(profileId: UUID, accountId: UUID, investorWithdrawalReason: string | null): Promise<WithdrawalError | null> {
    try {
      await this.createWithdrawalFundsRequestUseCase.execute(profileId, accountId, investorWithdrawalReason);

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
    return this.withdrawalRequestsQuery.getFundsWithdrawalRequest(profileId, accountId);
  }

  async getPendingWithdrawalRequest(profileId: UUID, accountId: UUID) {
    return this.withdrawalRequestsQuery.getPendingWithdrawalRequest(profileId, accountId);
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

  async pushWithdrawalDocuments(withdrawalId: UUID): Promise<void> {
    await this.pushWithdrawalsDocumentCreationUseCase.execute(withdrawalId);
  }

  async withdrawDividends(profileId: UUID, accountId: UUID, dividendIds: UUID[]): Promise<boolean> {
    const statuses = [];

    for (const dividendId of dividendIds) {
      statuses.push(await this.withdrawDividendUseCase.execute(profileId, accountId, dividendId));
    }

    return statuses.some(status => status === true);
  }

  async acceptWithdrawalRequests(ids: UUID[]): Promise<boolean> {
    const statuses = [];

    for (const id of ids) {
      statuses.push(await this.acceptWithdrawalRequestsUseCase.execute(id));
    }

    return statuses.some(status => status === true);
  }

  async rejectWithdrawalRequests(ids: UUID[], decisionReason: string): Promise<boolean> {
    const statuses = [];

    for (const id of ids) {
      statuses.push(await this.rejectWithdrawalRequestsUseCase.execute(id, decisionReason));
    }

    return statuses.some(status => status === true);
  }

  async listFundsWithdrawalsPendingRequests(pagination: Pagination): Promise<WithdrawalRequestView[]> {
    return this.withdrawalRequestsQuery.listFundsWithdrawalsPendingRequests(pagination);
  }

  async listDividendsWithdrawalsRequests(pagination: Pagination): Promise<DividendRequestView[]> {
    return this.withdrawalRequestsQuery.listDividendsWithdrawalsRequests(pagination);
  }

  async listWithdrawalsDocuments(pagination: Pagination): Promise<WithdrawalView[]> {
    return this.withdrawalsQuery.listWithdrawals(pagination);
  }

  async markWithdrawalAsCompleted(withdrawalId: UUID): Promise<void> {
    await this.markWithdrawalAsCompletedUseCase.execute(withdrawalId);
  }
}
