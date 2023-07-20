import { Pagination, UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalError, WithdrawalView } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class FundsWithdrawalRequestsQuery {
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private withdrawalsQuery: WithdrawalsQuery;

  constructor(fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository, withdrawalsQuery: WithdrawalsQuery) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.withdrawalsQuery = withdrawalsQuery;
  }

  static getClassName = () => 'FundsWithdrawalRequestsQuery';

  async getFundsWithdrawalRequest(profileId: UUID, accountId: UUID): Promise<WithdrawalView | never> {
    const fundsWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsWithdrawalRequest) {
      throw new Error(WithdrawalError.NO_PENDING_WITHDRAWAL_REQUEST);
    }

    return fundsWithdrawalRequest.getWithdrawalView();
  }

  async listFundsWithdrawalsPendingRequests(pagination: Pagination): Promise<WithdrawalView[]> {
    const requests = await this.fundsWithdrawalRequestsRepository.listPendingWithdrawalRequests(pagination);

    return requests.map(request => request.getWithdrawalView());
  }
}
