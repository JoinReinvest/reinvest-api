import { UUID } from 'HKEKTypes/Generics';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { DividendData, SettledSharesData } from 'Withdrawals/Domain/FundsWithdrawalRequest';
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
  payoutId: null;
  profileId: UUID;
  redemptionId: null;
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

  async execute(profileId: UUID, accountId: UUID) {
    const withdrawalsState = await this.withdrawalsQuery.prepareEligibleWithdrawalsState(profileId, accountId);

    if (!withdrawalsState) {
      return false;
    }

    const id = this.idGenerator.createUuid();

    const { accountValue, numberOfShares, totalDividends, totalFee, totalFunds, eligibleFunds } = withdrawalsState.getEligibleWhithdrawalsData();

    const withdrawalFundsRequest: WithdrawalFundsRequestCreate = {
      id,
      profileId,
      accountId,
      adminDecisionReason: null,
      agreementId: null,
      dateDecision: null,
      investorWithdrawalReason: null,
      payoutId: null,
      redemptionId: null,
      dateCreated: new Date(),
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

    return id;
  }
}
