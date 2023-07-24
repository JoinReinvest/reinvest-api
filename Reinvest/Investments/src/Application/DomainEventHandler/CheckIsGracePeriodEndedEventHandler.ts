import { TransactionCommands } from 'Investments/Domain/Transaction/TransactionCommands';
import { GracePeriodEnded, TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { DateTime } from 'Money/DateTime';
import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class CheckIsGracePeriodEndedEventHandler implements EventHandler<TransactionEvent> {
  private investmentRepository: InvestmentsRepository;
  private eventBus: EventBus;

  constructor(investmentRepository: InvestmentsRepository, eventBus: EventBus) {
    this.investmentRepository = investmentRepository;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'CheckIsGracePeriodEndedEventHandler';

  async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== TransactionCommands.CheckIsGracePeriodEnded) {
      return;
    }

    const investmentId = event.id;
    const investment = await this.investmentRepository.getByInvestmentId(investmentId);

    if (!investment) {
      throw new Error(`Investment with id ${investmentId} not found`);
    }

    console.log(`Awaiting grace period end for transaction ${investmentId}`);

    if (investment && investment.isGracePeriodEnded()) {
      await this.eventBus.publish(<GracePeriodEnded>{
        kind: TransactionEvents.GRACE_PERIOD_ENDED,
        id: investmentId,
        date: DateTime.now().toDate(),
        data: {},
      });
    }
  }
}
