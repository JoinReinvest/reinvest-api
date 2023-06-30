import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { WithdrawalsDatabase } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { DividendWithdrawalRequest } from 'Withdrawals/Domain/DividendWithdrawalRequest';

export class WithdrawDividend {
  private sharesAndDividendsService: SharesAndDividendsService;
  private idGenerator: IdGeneratorInterface;
  private dividendsRequestsRepository: DividendsRequestsRepository;
  private transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>;

  constructor(
    sharesAndDividendsService: SharesAndDividendsService,
    dividendsRequestsRepository: DividendsRequestsRepository,
    transactionAdapter: TransactionalAdapter<WithdrawalsDatabase>,
    idGenerator: IdGeneratorInterface,
  ) {
    this.dividendsRequestsRepository = dividendsRequestsRepository;
    this.transactionAdapter = transactionAdapter;
    this.sharesAndDividendsService = sharesAndDividendsService;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'WithdrawDividend';

  async execute(profileId: UUID, accountId: UUID, dividendId: UUID): Promise<boolean> {
    try {
      const dividend = await this.sharesAndDividendsService.findDividend(profileId, dividendId);
      const id = this.idGenerator.createUuid();
      const dividendRequest = DividendWithdrawalRequest.create(id, dividend, profileId, accountId);

      dividendRequest.autoApprove();

      return this.transactionAdapter.transaction(`Dividend ${dividendId} withdrawal for account ${profileId}/${accountId}`, async () => {
        await this.dividendsRequestsRepository.store(dividendRequest);
        await this.sharesAndDividendsService.markDividendAsWithdrew(profileId, dividendId);
      });
    } catch (error: any) {
      console.log(`Dividend ${dividendId} withdrawal for account ${profileId}/${accountId} failed`, error);

      return false;
    }
  }
}
