import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { MarkFundsAsReadyToDisburse } from 'Trading/IntegrationLogic/UseCase/MarkFundsAsReadyToDisburse';

export class TransferSharesWhenTradeSettledHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;
  private markFundsAsReadyToDisburseUseCase: MarkFundsAsReadyToDisburse;

  constructor(markFundsAsReadyToDisburseUseCase: MarkFundsAsReadyToDisburse, eventBus: EventBus) {
    this.eventBus = eventBus;
    this.markFundsAsReadyToDisburseUseCase = markFundsAsReadyToDisburseUseCase;
  }

  static getClassName = (): string => 'TransferSharesWhenTradeSettledHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'TransferSharesWhenTradeSettled') {
      return;
    }

    const investmentId = event.id;

    // todo RIA-???
    if (await this.markFundsAsReadyToDisburseUseCase.execute(investmentId)) {
      await this.eventBus.publish({
        kind: 'InvestmentSharesTransferred',
        id: investmentId,
      });
    }
  }
}
