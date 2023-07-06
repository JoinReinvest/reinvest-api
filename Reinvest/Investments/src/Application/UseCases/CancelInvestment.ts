import { InvestmentCanceled, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class CancelInvestment {
  private readonly investmentsRepository: InvestmentsRepository;
  private eventBus: EventBus;

  constructor(investmentsRepository: InvestmentsRepository, eventBus: EventBus) {
    this.investmentsRepository = investmentsRepository;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'CancelInvestment';

  async execute(profileId: string, investmentId: string): Promise<boolean> {
    try {
      const investment = await this.investmentsRepository.getInvestmentByProfileAndId(profileId, investmentId);

      if (!investment) {
        return false;
      }

      investment.cancel();
      await this.investmentsRepository.store(investment);

      await this.eventBus.publish(<InvestmentCanceled>{
        kind: TransactionEvents.INVESTMENT_CANCELED,
        date: new Date(),
        id: investmentId,
        data: {},
      });

      return true;
    } catch (error: any) {
      console.log(`Cancel investment ${investmentId} error`, error);

      return false;
    }
  }
}
