import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { TransferSharesWhenTradeSettled } from 'Trading/IntegrationLogic/UseCase/TransferSharesWhenTradeSettled';

export class TransferSharesWhenTradeSettledHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;
  private transferSharesWhenTradeSettled: TransferSharesWhenTradeSettled;

  constructor(transferSharesWhenTradeSettled: TransferSharesWhenTradeSettled, eventBus: EventBus) {
    this.eventBus = eventBus;
    this.transferSharesWhenTradeSettled = transferSharesWhenTradeSettled;
  }

  static getClassName = (): string => 'TransferSharesWhenTradeSettledHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'TransferSharesWhenTradeSettled') {
      return;
    }

    const investmentId = event.id;

    if (await this.transferSharesWhenTradeSettled.execute(investmentId)) {
      await this.eventBus.publish({
        kind: 'InvestmentSharesTransferred',
        id: investmentId,
      });
    }
  }
}
