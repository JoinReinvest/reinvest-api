import { UUID } from 'HKEKTypes/Generics';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { WithdrawalsDatabase } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { FundsWithdrawalRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsWithdrawalRequestsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';

class AbortFundsWithdrawalRequest {
  private readonly fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository;
  private sharesAndDividendsService: SharesAndDividendsService;
  private transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>;

  constructor(
    fundsWithdrawalRequestsRepository: FundsWithdrawalRequestsRepository,
    sharesAndDividendsService: SharesAndDividendsService,
    transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>,
  ) {
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.transactionAdapter = transactionAdapter;
    this.fundsWithdrawalRequestsRepository = fundsWithdrawalRequestsRepository;
  }

  static getClassName = (): string => 'AbortFundsWithdrawalRequest';

  async execute(profileId: UUID, accountId: UUID) {
    try {
      const fundsWithdrawalRequests = await this.fundsWithdrawalRequestsRepository.getPendingWithdrawalRequest(profileId, accountId);

      if (!fundsWithdrawalRequests) {
        return false;
      }

      fundsWithdrawalRequests.abort();

      return await this.transactionAdapter.transaction(`Aborting withdrawal requests for account ${accountId}`, async () => {
        await this.fundsWithdrawalRequestsRepository.updateStatus(fundsWithdrawalRequests);
        const sharesIds = fundsWithdrawalRequests.getShareIds();
        await this.sharesAndDividendsService.abortSharesWithdrawing(sharesIds);
        const dividendsIds = fundsWithdrawalRequests.getDividendIds();
        await this.sharesAndDividendsService.abortDividendsWithdrawing(dividendsIds);
      });
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}

export default AbortFundsWithdrawalRequest;
