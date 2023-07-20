import { Pagination, UUID } from 'HKEKTypes/Generics';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { DividendRequestView } from 'Withdrawals/Domain/DividendWithdrawalRequest';
import { WithdrawalError, WithdrawalRequestView } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class FundsWithdrawalRequestsQuery {
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private withdrawalsQuery: WithdrawalsQuery;
  private dividendsRequestsRepository: DividendsRequestsRepository;

  constructor(
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    withdrawalsQuery: WithdrawalsQuery,
    dividendsRequestsRepository: DividendsRequestsRepository,
  ) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.withdrawalsQuery = withdrawalsQuery;
    this.dividendsRequestsRepository = dividendsRequestsRepository;
  }

  static getClassName = () => 'FundsWithdrawalRequestsQuery';

  async getFundsWithdrawalRequest(profileId: UUID, accountId: UUID): Promise<WithdrawalRequestView | never> {
    const fundsWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsWithdrawalRequest) {
      throw new Error(WithdrawalError.NO_PENDING_WITHDRAWAL_REQUEST);
    }

    return fundsWithdrawalRequest.getWithdrawalView();
  }

  async listFundsWithdrawalsPendingRequests(pagination: Pagination): Promise<WithdrawalRequestView[]> {
    const requests = await this.fundsWithdrawalRequestsRepository.listPendingWithdrawalRequests(pagination);

    return requests.map(request => request.getWithdrawalView());
  }

  async listDividendsWithdrawalsRequests(pagination: Pagination): Promise<DividendRequestView[]> {
    const requests = await this.dividendsRequestsRepository.listDividendsWithdrawalsRequests(pagination);

    return requests.map(request => request.getView());
  }
}
