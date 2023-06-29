import { InvestmentCanceled, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsDatabase } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class CancelInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private readonly feesRepository: FeesRepository;
  private readonly transactionAdapter: TransactionalAdapter<InvestmentsDatabase>;
  private eventBus: EventBus;

  constructor(
    investmentsRepository: InvestmentsRepository,
    feesRepository: FeesRepository,
    transactionAdapter: TransactionalAdapter<InvestmentsDatabase>,
    eventBus: EventBus,
  ) {
    this.investmentsRepository = investmentsRepository;
    this.feesRepository = feesRepository;
    this.transactionAdapter = transactionAdapter;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'CancelInvestment';

  async execute(profileId: string, investmentId: string): Promise<boolean> {
    try {
      const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

      if (!investment) {
        return false;
      }

      const cancelStatus = investment.cancel();

      if (!cancelStatus) {
        return false;
      }

      return this.transactionAdapter.transaction(`Cancel investment ${investmentId} with related fee if exist`, async () => {
        await this.investmentsRepository.updateStatus(investment);

        const fee = investment.getFee();

        if (fee) {
          await this.feesRepository.storeFee(fee);
        }

        await this.eventBus.publish(<InvestmentCanceled>{
          kind: TransactionEvents.INVESTMENT_CANCELED,
          date: new Date(),
          id: investmentId,
          data: {},
        });
      });
    } catch (error: any) {
      console.log(`Cancel investment ${investmentId} error`, error);

      return false;
    }
  }
}
