import { UUID } from 'HKEKTypes/Generics';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { WithdrawalsDatabase } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
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
  investorWithdrawalReason: string | null;
  numberOfShares: number;
  profileId: UUID;
  sharesJson: SettledSharesData[];
  status: WithdrawalsFundsRequestsStatuses;
  totalDividends: number;
  totalFee: number;
  totalFunds: number;
  withdrawalId: null;
};

export class CreateWithdrawalFundsRequest {
  private idGenerator: IdGenerator;
  private fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private sharesAndDividendsService: SharesAndDividendsService;
  private transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>;
  private withdrawalsQuery: WithdrawalsQuery;

  constructor(
    idGenerator: IdGenerator,
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    withdrawalsQuery: WithdrawalsQuery,
    sharesAndDividendsService: SharesAndDividendsService,
    transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>,
  ) {
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.transactionAdapter = transactionAdapter;
    this.idGenerator = idGenerator;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.withdrawalsQuery = withdrawalsQuery;
  }

  static getClassName = () => 'CreateWithdrawalFundsRequest';

  async execute(profileId: UUID, accountId: UUID, investorWithdrawalReason: string | null): Promise<void | never> {
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
      investorWithdrawalReason: investorWithdrawalReason,
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

    const status = await this.transactionAdapter.transaction(`Creating withdrawal requests for account ${accountId}`, async () => {
      await this.fundsWithdrawalRequestsRepository.create(withdrawalFundsRequest);
      const sharesIds = withdrawalsState.getSettledSharesIds();
      await this.sharesAndDividendsService.sharesWithdrawing(sharesIds);
      const dividendsIds = withdrawalsState.getAwaitingDividendsIds();
      await this.sharesAndDividendsService.dividendsWithdrawing(dividendsIds);
    });

    if (!status) {
      throw new Error(WithdrawalError.CANNOT_CREATED_UNKNOWN_ERROR);
    }
  }
}
