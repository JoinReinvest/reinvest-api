import { UUID } from 'HKEKTypes/Generics';
import { FundsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsRequestsRepository';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class GetFundsWithdrawalRequest {
  private fundsRequestsRepository: FundsRequestsRepository;
  private withdrawalsQuery: WithdrawalsQuery;

  constructor(fundsRequestsRepository: FundsRequestsRepository, withdrawalsQuery: WithdrawalsQuery) {
    this.fundsRequestsRepository = fundsRequestsRepository;
    this.withdrawalsQuery = withdrawalsQuery;
  }

  static getClassName = () => 'GetFundsWithdrawalRequest';

  async execute(profileId: UUID, accountId: UUID, id: UUID) {
    const fundsWithdrawalRequest = await this.fundsRequestsRepository.get(profileId, accountId, id);

    if (!fundsWithdrawalRequest) {
      return false;
    }

    const withdrawalsState = await this.withdrawalsQuery.prepareEligibleWithdrawalsState(profileId, accountId);

    if (!withdrawalsState) {
      return false;
    }

    const { status, dateCreated, dateDecision, adminDecisionReason } = fundsWithdrawalRequest.toObject();

    return {
      status,
      createdData: dateCreated,
      decisionDate: dateDecision,
      decisionMessage: adminDecisionReason,
      eligibleForWithDrawal: withdrawalsState.getEligibleForWithdrawalsAmount(),
      accountValue: withdrawalsState.getAccountValueAmount(),
      penaltiesFee: withdrawalsState.getPenaltiesFeeAmount(),
    };
  }
}
