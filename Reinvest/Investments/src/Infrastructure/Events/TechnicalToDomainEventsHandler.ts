import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
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
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.ACCOUNT_VERIFIED_FOR_INVESTMENT,
          date: new Date(),
          data: {
            accountId: event.data.accountId,
          },
          id: event.id,
        });
        break;
      case 'TradeCreated':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.TRADE_CREATED,
          date: new Date(),
          data: {
            ...event.data,
          },
          id: event.id,
        });
        break;
      case 'InvestmentFunded':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.INVESTMENT_FUNDED,
          date: new Date(),
          data: {},
          id: event.id,
        });
        break;
      case 'InvestmentApproved':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.INVESTMENT_APPROVED,
          date: new Date(),
          data: {},
          id: event.id,
        });
        break;
      case 'InvestmentMarkedAsReadyToDisburse':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.MARKED_AS_READY_TO_DISBURSE,
          date: new Date(),
          data: {},
          id: event.id,
        });
        break;
      case 'InvestmentSharesTransferred':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.INVESTMENT_SHARES_TRANSFERRED,
          date: new Date(),
          data: {},
          id: event.id,
        });
        break;
      default:
        break;
    }
  }
}
