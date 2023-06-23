import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class GetFundsWithdrawalRequest {
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private withdrawalsQuery: WithdrawalsQuery;

  constructor(fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository, withdrawalsQuery: WithdrawalsQuery) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.withdrawalsQuery = withdrawalsQuery;
  }

  static getClassName = () => 'GetFundsWithdrawalRequest';

  async execute(profileId: UUID, accountId: UUID) {
    const fundsWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsWithdrawalRequest) {
      return false;
    }

    const withdrawalsState = await this.withdrawalsQuery.prepareEligibleWithdrawalsState(profileId, accountId);

    if (!withdrawalsState) {
      return false;
    }

    const { dateCreated, dateDecision, adminDecisionReason } = fundsWithdrawalRequest.toObject();

    const status = fundsWithdrawalRequest.getReturnStatusValue();

    return {
      status,
      createdDate: dateCreated,
      decisionDate: dateDecision,
      decisionMessage: adminDecisionReason,
      eligibleForWithdrawal: withdrawalsState.getEligibleForWithdrawalsAmount(),
      accountValue: withdrawalsState.getAccountValueAmount(),
      penaltiesFee: withdrawalsState.getPenaltiesFeeAmount(),
    };
  }
}
