import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { UnwindTrade } from 'Trading/IntegrationLogic/UseCase/UnwindTrade';

export enum CancelTradeEvent {
  TransactionCanceled = 'TransactionCanceled',
  TransactionUnwinding = 'TransactionUnwinding',
  TransactionCanceledFailed = 'TransactionCanceledFailed',
}

export class CancelTradeHandler implements EventHandler<DomainEvent> {
  private unwindTradeUseCase: UnwindTrade;
  private eventBus: EventBus;

  constructor(cancelTradeUseCase: UnwindTrade, eventBus: EventBus) {
    this.unwindTradeUseCase = cancelTradeUseCase;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'CancelTradeHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'CancelTransaction') {
      return;
    }

    const actionEvent = await this.unwindTradeUseCase.execute(event.id);

    if (!actionEvent) {
      return;
    }

    const reason = actionEvent?.reason ?? '';

    switch (actionEvent.event) {
      case 'Unwound':
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionCanceled,
          id: event.id,
          data: {},
        });
        break;
      case 'Unwinding':
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionUnwinding,
          id: event.id,
          data: {},
        });
        break;
      case 'Failed':
        await this.eventBus.publish({
          kind: CancelTradeEvent.TransactionCanceledFailed,
          id: event.id,
          data: {
            reason,
          },
        });
        break;
      default:
        break;
    }
  }
}
