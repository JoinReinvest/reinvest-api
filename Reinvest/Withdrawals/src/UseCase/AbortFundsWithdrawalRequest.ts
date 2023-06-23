import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';

class AbortFundsWithdrawalRequest {
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  static getClassName = (): string => 'AbortFundsWithdrawalRequest';

  async execute(profileId: UUID, accountId: UUID) {
    try {
      const fundsWithdrawalRequests = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

      if (!fundsWithdrawalRequests) {
        return false;
      }

      fundsWithdrawalRequests.abort();

      const status = await this.fundsWithdrawalRequestsRepository.updateStatus(fundsWithdrawalRequests);

      return status;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AbortFundsWithdrawalRequest;
