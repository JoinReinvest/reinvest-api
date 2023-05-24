import { TransactionCommands } from 'Investments/Domain/Transaction/TransactionCommands';
import { GracePeriodEnded, TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
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
    // TODO read investment from repository
    await this.eventBus.publish(<GracePeriodEnded>{
      kind: TransactionEvents.GRACE_PERIOD_ENDED,
      id: investmentId,
      date: new Date(),
      data: {},
    });
  }
}
