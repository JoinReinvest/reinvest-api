import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
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

      if (fundsWithdrawalRequests.reject(decisionReason)) {
        await this.fundsWithdrawalRequestsRepository.reject(fundsWithdrawalRequests, id);
        const { profileId, ...data } = fundsWithdrawalRequests.forEvent();
        await this.fundsWithdrawalRequestsRepository.publishEvents([storeEventCommand(profileId, 'WithdrawalRequestRejected', data)]);
      }

      return true;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default RejectWithdrawalRequests;
