import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { WithdrawalsDatabase } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';

class RejectWithdrawalRequests {
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;

  constructor(
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    sharesAndDividendsService: SharesAndDividendsService,
    transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>,
  ) {
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.transactionAdapter = transactionAdapter;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  static getClassName = (): string => 'RejectWithdrawalRequests';
  private sharesAndDividendsService: SharesAndDividendsService;
  private transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>;

  async execute(id: string, decisionReason: string): Promise<boolean> {
    try {
      const fundsWithdrawalRequests = await this.fundsWithdrawalRequestsRepository.getRequestedFundsWithdrawalRequests(id);

      if (!fundsWithdrawalRequests) {
        return false;
      }

      return await this.transactionAdapter.transaction(`Rejecting withdrawal requests for request id ${id}`, async () => {
        if (fundsWithdrawalRequests.reject(decisionReason)) {
          await this.fundsWithdrawalRequestsRepository.reject(fundsWithdrawalRequests, id);
          const sharesIds = fundsWithdrawalRequests.getShareIds();
          await this.sharesAndDividendsService.abortSharesWithdrawing(sharesIds);
          const dividendsIds = fundsWithdrawalRequests.getDividendIds();
          await this.sharesAndDividendsService.abortDividendsWithdrawing(dividendsIds);
          const { profileId, ...data } = fundsWithdrawalRequests.forEvent();
          await this.fundsWithdrawalRequestsRepository.publishEvents([storeEventCommand(profileId, 'WithdrawalRequestRejected', data)]);
        }
      });
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default RejectWithdrawalRequests;
