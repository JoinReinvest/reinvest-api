import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';

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

    if (!fundsWithdrawalRequest.isAgreementAssigned()) {
      throw new Error(WithdrawalError.WITHDRAWAL_AGREEMENT_NOT_SIGNED);
    }

    if (!fundsWithdrawalRequest.isDraft()) {
      throw new Error(WithdrawalError.WITHDRAWAL_REQUEST_ALREADY_SENT);
    }

    fundsWithdrawalRequest.request();

    await this.fundsWithdrawalRequestsRepository.updateStatus(fundsWithdrawalRequest);
  }
}
