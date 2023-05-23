import { InvestmentFinalized, TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';

export class FinalizeInvestmentEventHandler implements EventHandler<TransactionEvent> {
  private investmentRepository: InvestmentsRepository;
  private eventBus: EventBus;

  constructor(investmentRepository: InvestmentsRepository, eventBus: EventBus) {
    this.investmentRepository = investmentRepository;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'FinalizeInvestmentEventHandler';

  async handle(event: TransactionEvent): Promise<void> {
    const investmentId = event.id;
    // todo read investment from repository
    // send some notification if needed
    // if everything is fine then send finalization event
    const subscriptionAgreementId = '1aff4de0-bed6-4b4d-8a10-98aac94d9d74';
    const portfolioId = 'b3979627-8371-4452-a3a2-27b73df04dab';
    const bankAccountId = '69953c8b-34fe-4d0b-aec3-1a8a426827a8';

    await this.eventBus.publish(<InvestmentFinalized>{
      kind: TransactionEvents.INVESTMENT_FINALIZED,
      data: {
        amount: 10000,
        fees: 700,
        ip: '8.8.8.8',
        bankAccountId,
        subscriptionAgreementId,
        portfolioId,
      },
      id: investmentId,
    });
  }
}
