import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { WithdrawalsDatabase } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';

class AcceptWithdrawalRequests {
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private sharesAndDividendsService: SharesAndDividendsService;
  private transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>;

  constructor(
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    sharesAndDividendsService: SharesAndDividendsService,
    transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>,
  ) {
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.transactionAdapter = transactionAdapter;
  }

  static getClassName = (): string => 'AcceptWithdrawalRequests';

  async execute(id: string): Promise<boolean> {
    try {
      const fundsWithdrawalRequests = await this.fundsWithdrawalRequestsRepository.getRequestedFundsWithdrawalRequests(id);

      if (!fundsWithdrawalRequests) {
        return false;
      }

      return await this.transactionAdapter.transaction(`Accepting withdrawal requests for request id ${id}`, async () => {
        if (fundsWithdrawalRequests.accept()) {
          await this.fundsWithdrawalRequestsRepository.accept(fundsWithdrawalRequests, id);

          const sharesIds = fundsWithdrawalRequests.getShareIds();
          await this.sharesAndDividendsService.completeSharesWithdrawing(sharesIds);
          const dividendsIds = fundsWithdrawalRequests.getDividendIds();
          await this.sharesAndDividendsService.completeDividendsWithdrawing(dividendsIds);

          const { profileId, ...data } = fundsWithdrawalRequests.forEvent();
          await this.fundsWithdrawalRequestsRepository.publishEvents([storeEventCommand(profileId, 'WithdrawalRequestApproved', data)]);
        }
      });
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AcceptWithdrawalRequests;
