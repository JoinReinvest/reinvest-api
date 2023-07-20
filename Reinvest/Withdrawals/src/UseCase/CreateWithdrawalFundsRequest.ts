import { UUID } from 'HKEKTypes/Generics';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { DividendData, SettledSharesData, WithdrawalError } from 'Withdrawals/Domain/FundsWithdrawalRequest';
import { WithdrawalsFundsRequestsStatuses } from 'Withdrawals/Domain/WithdrawalsFundsRequests';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export type WithdrawalFundsRequestCreate = {
  accountId: UUID;
  accountValue: number;
  adminDecisionReason: null;
  agreementId: null;
  dateCreated: Date;
  dateDecision: null;
  dividendsJson: DividendData[];
  eligibleFunds: number;
  id: UUID;
  investorWithdrawalReason: null;
  numberOfShares: number;
  profileId: UUID;
  withdrawalId: null;
  sharesJson: SettledSharesData[];
  status: WithdrawalsFundsRequestsStatuses;
  totalDividends: number;
  totalFee: number;
  totalFunds: number;
};

export class CreateWithdrawalFundsRequest {
  private idGenerator: IdGenerator;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private withdrawalsQuery: WithdrawalsQuery;

  constructor(idGenerator: IdGenerator, fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository, withdrawalsQuery: WithdrawalsQuery) {
    this.idGenerator = idGenerator;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.withdrawalsQuery = withdrawalsQuery;
  }

  static getClassName = () => 'CreateWithdrawalFundsRequest';

  async execute(profileId: UUID, accountId: UUID): Promise<void | never> {
    const pendingWithdrawalRequest = await this.fundsWithdrawalRequestsRepository.getPendingWithdrawalRequest(profileId, accountId);

    if (pendingWithdrawalRequest && pendingWithdrawalRequest.isRequested()) {
      throw new Error(WithdrawalError.PENDING_WITHDRAWAL_EXISTS);
    } else if (pendingWithdrawalRequest) {
      return;
    }

    const withdrawalsState = await this.withdrawalsQuery.prepareEligibleWithdrawalsState(profileId, accountId);

    if (!withdrawalsState || !withdrawalsState.canWithdraw()) {
      throw new Error(WithdrawalError.CAN_NOT_WITHDRAW);
    }

    const id = this.idGenerator.createUuid();

    const { accountValue, numberOfShares, totalDividends, totalFee, totalFunds, eligibleFunds } = withdrawalsState.getEligibleWithdrawalsData();

    const withdrawalFundsRequest: WithdrawalFundsRequestCreate = {
      id,
      profileId,
      accountId,
      adminDecisionReason: null,
      agreementId: null,
      dateDecision: null,
      investorWithdrawalReason: null,
      withdrawalId: null,
      dateCreated: DateTime.now().toDate(),
      status: WithdrawalsFundsRequestsStatuses.DRAFT,
      dividendsJson: withdrawalsState.formatAwaitingDividends(),
      sharesJson: withdrawalsState.formatSettledShares(),
      accountValue,
      eligibleFunds,
      numberOfShares,
      totalDividends,
      totalFunds,
      totalFee,
    };

    await this.fundsWithdrawalRequestsRepository.create(withdrawalFundsRequest);
  }
}
