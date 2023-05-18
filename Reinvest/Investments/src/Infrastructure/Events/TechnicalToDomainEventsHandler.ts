import { TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class TechnicalToDomainEventsHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'TechnicalToDomainEventsHandler';

  public async handle(event: DomainEvent): Promise<void> {
    switch (event.kind) {
      case 'AccountVerifiedForInvestment':
        await this.eventBus.publish({
          kind: TransactionEvents.ACCOUNT_VERIFIED_FOR_INVESTMENT,
          data: {
            accountId: event.data.accountId,
          },
          id: event.id,
        });
        break;
      default:
        break;
    }
  }
}
