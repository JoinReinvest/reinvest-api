import { ReinvestmentEvents, SharesTransferredForReinvestment } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { TransactionCanceledFailed, TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { DateTime } from 'Money/DateTime';

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
          date: DateTime.now().toDate(),
          data: {
            accountId: event.data.accountId,
          },
          id: event.id,
        });
        break;
      case 'TradeCreated':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.TRADE_CREATED,
          date: DateTime.now().toDate(),
          data: {
            ...event.data,
          },
          id: event.id,
        });
        break;
      case 'InvestmentFunded':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.INVESTMENT_FUNDED,
          date: DateTime.now().toDate(),
          data: {},
          id: event.id,
        });
        break;
      case 'InvestmentApproved':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.INVESTMENT_APPROVED,
          date: DateTime.now().toDate(),
          data: {},
          id: event.id,
        });
        break;
      case 'InvestmentMarkedAsReadyToDisburse':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.MARKED_AS_READY_TO_DISBURSE,
          date: DateTime.now().toDate(),
          data: {},
          id: event.id,
        });
        break;
      case 'InvestmentSharesTransferred':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.INVESTMENT_SHARES_TRANSFERRED,
          date: DateTime.now().toDate(),
          data: {},
          id: event.id,
        });
        break;
      case 'TransactionCanceled':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.TRANSACTION_CANCELED,
          date: DateTime.now().toDate(),
          data: {},
          id: event.id,
        });
        break;
      case 'TransactionUnwinding':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.TRANSACTION_CANCELED_UNWINDING,
          date: DateTime.now().toDate(),
          data: {},
          id: event.id,
        });
        break;
      case 'TransactionCanceledFailed':
        await this.eventBus.publish(<TransactionCanceledFailed>{
          kind: TransactionEvents.TRANSACTION_CANCELED_FAILED,
          date: DateTime.now().toDate(),
          data: {
            reason: event.data.reason,
          },
          id: event.id,
        });
        break;
      case 'GracePeriodEnded':
        await this.eventBus.publish(<TransactionEvent>{
          kind: TransactionEvents.GRACE_PERIOD_ENDED,
          date: DateTime.now().toDate(),
          data: {},
          id: event.id,
        });
        break;
      case 'ReinvestmentSharesTransferred':
        await this.eventBus.publish(<SharesTransferredForReinvestment>{
          kind: ReinvestmentEvents.SHARES_TRANSFERRED_FOR_REINVESTMENT,
          date: DateTime.now().toDate(),
          data: {
            numberOfShares: event.data.shares,
            unitPrice: event.data.unitSharePrice,
          },
          id: event.id,
        });
        break;
      default:
        break;
    }
  }
}
