import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';

class AcceptWithdrawalRequests {
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  static getClassName = (): string => 'AcceptWithdrawalRequests';

  async execute(id: string): Promise<boolean> {
    try {
      const fundsWithdrawalRequests = await this.fundsWithdrawalRequestsRepository.getRequestedFundsWithdrawalRequests(id);

      if (!fundsWithdrawalRequests) {
        return false;
      }

      fundsWithdrawalRequests.accept();

      const status = await this.fundsWithdrawalRequestsRepository.accept(fundsWithdrawalRequests, id);

      return status;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AcceptWithdrawalRequests;
