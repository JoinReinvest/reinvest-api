import { InvestmentFeeService } from 'Investments/Domain/Service/InvestmentFeeService';
import { InvestmentCanceled, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { DateTime } from 'Money/DateTime';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class CancelInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private eventBus: EventBus;
  private investmentFeeService: InvestmentFeeService;
  private transactionAdapter: TransactionalAdapter<InvestmentsDatabase>;

  constructor(
    investmentsRepository: InvestmentsRepository,
    eventBus: EventBus,
    investmentFeeService: InvestmentFeeService,
    transactionAdapter: TransactionalAdapter<InvestmentsDatabase>,
  ) {
    this.investmentsRepository = investmentsRepository;
    this.eventBus = eventBus;
    this.investmentFeeService = investmentFeeService;
    this.transactionAdapter = transactionAdapter;
  }

  static getClassName = (): string => 'CancelInvestment';

  async execute(profileId: string, investmentId: string): Promise<boolean> {
    try {
      const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

      if (!investment) {
        return false;
      }

      return await this.transactionAdapter.transaction(`Abort transaction ${investmentId}`, async () => {
        const cancelStatus = investment.cancel();

        if (cancelStatus) {
          await this.investmentFeeService.withdrawFee(investment.getFee());
          await this.investmentsRepository.store(investment);

          await this.eventBus.publish(<InvestmentCanceled>{
            kind: TransactionEvents.INVESTMENT_CANCELED,
            date: DateTime.now().toDate(),
            id: investmentId,
            data: {},
          });
        }
      });
    } catch (error: any) {
      console.log(`Cancel investment ${investmentId} error`, error);

      return false;
    }
  }
}
