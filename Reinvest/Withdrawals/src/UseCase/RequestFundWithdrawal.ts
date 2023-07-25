import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class RequestFundWithdrawal {
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  static getClassName = () => 'RequestFundWithdrawal';

  async execute(profileId: UUID, accountId: UUID) {
    const fundsWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsWithdrawalRequest) {
      throw new Error(WithdrawalError.NO_PENDING_WITHDRAWAL_REQUEST);
    }

    fundsWithdrawalRequest.request();

    await this.fundsWithdrawalRequestsRepository.updateStatus(fundsWithdrawalRequest);

    await this.fundsWithdrawalRequestsRepository.publishEvents([storeEventCommand(profileId, 'WithdrawalRequestSent', fundsWithdrawalRequest.forEvent())]);
  }
}
