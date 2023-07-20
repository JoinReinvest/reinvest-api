import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
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

      if (fundsWithdrawalRequests.accept()) {
        await this.fundsWithdrawalRequestsRepository.accept(fundsWithdrawalRequests, id);
        const { profileId, ...data } = fundsWithdrawalRequests.forEvent();
        await this.fundsWithdrawalRequestsRepository.publishEvents([storeEventCommand(profileId, 'WithdrawalRequestApproved', data)]);
      }

      return true;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AcceptWithdrawalRequests;
