import { UUID } from 'HKEKTypes/Generics';
import { FundsWithdrawalRequestsAgreementsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsAgreementsRepository';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';

import { WithdrawalsQuery } from './WithdrawalsQuery';

export class RequestFundWithdrawal {
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository;
  private withdrawalsQuery: WithdrawalsQuery;

  constructor(
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    fundsWithdrawalRequestsAgreementsRepository: FundsWithdrawalRequestsAgreementsRepository,
    withdrawalsQuery: WithdrawalsQuery,
  ) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.fundsWithdrawalRequestsAgreementsRepository = fundsWithdrawalRequestsAgreementsRepository;
    this.withdrawalsQuery = withdrawalsQuery;
  }

  static getClassName = () => 'RequestFundWithdrawal';

  async execute(profileId: UUID, accountId: UUID) {
    const fundsWithdrawalRequestAgreement = await this.fundsWithdrawalRequestsAgreementsRepository.getAgreement(profileId, accountId);

    if (fundsWithdrawalRequestAgreement && !fundsWithdrawalRequestAgreement.isSigned()) {
      return false;
    }

    const fundsWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.get(profileId, accountId);

    if (!fundsWithdrawalRequest) {
      return false;
    }

    fundsWithdrawalRequest.request();

    await this.fundsWithdrawalRequestsRepository.updateStatus(fundsWithdrawalRequest);

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
      eligibleForWithDrawal: withdrawalsState.getEligibleForWithdrawalsAmount(),
      accountValue: withdrawalsState.getAccountValueAmount(),
      penaltiesFee: withdrawalsState.getPenaltiesFeeAmount(),
    };
  }
}
