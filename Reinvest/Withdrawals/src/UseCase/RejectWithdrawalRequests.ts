import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';

class RejectWithdrawalRequests {
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  static getClassName = (): string => 'RejectWithdrawalRequests';

  async execute(id: string, decisionReason: string): Promise<boolean> {
    try {
      const fundsWithdrawalRequests = await this.fundsWithdrawalRequestsRepository.getRequestedFundsWithdrawalRequests(id);

      if (!fundsWithdrawalRequests) {
        return false;
      }

      fundsWithdrawalRequests.reject(decisionReason);

      const status = await this.fundsWithdrawalRequestsRepository.reject(fundsWithdrawalRequests, id);

      return status;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default RejectWithdrawalRequests;
