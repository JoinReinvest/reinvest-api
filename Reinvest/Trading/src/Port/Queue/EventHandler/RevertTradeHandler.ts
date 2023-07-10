import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { UnwindTrade } from 'Trading/IntegrationLogic/UseCase/UnwindTrade';

export enum RevertTradeEvent {
  TransactionReverted = 'TransactionReverted',
  TransactionRevertedUnwinding = 'TransactionRevertedUnwinding',
  TransactionRevertedFailed = 'TransactionRevertedFailed',
}

export class RevertTradeHandler implements EventHandler<DomainEvent> {
  private unwindTradeUseCase: UnwindTrade;
  private eventBus: EventBus;

  constructor(cancelTradeUseCase: UnwindTrade, eventBus: EventBus) {
    this.unwindTradeUseCase = cancelTradeUseCase;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'RevertTradeHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'RevertTransaction') {
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
          kind: RevertTradeEvent.TransactionReverted,
          id: event.id,
          data: {},
        });
        break;
      case 'Unwinding':
        await this.eventBus.publish({
          kind: RevertTradeEvent.TransactionRevertedUnwinding,
          id: event.id,
          data: {},
        });
        break;
      case 'Failed':
        await this.eventBus.publish({
          kind: RevertTradeEvent.TransactionRevertedFailed,
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
