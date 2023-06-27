import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { CancelTrade } from 'Trading/IntegrationLogic/UseCase/CancelTrade';

export class CancelTradeHandler implements EventHandler<DomainEvent> {
  private cancelTradeUseCase: CancelTrade;

  constructor(cancelTradeUseCase: CancelTrade) {
    this.cancelTradeUseCase = cancelTradeUseCase;
  }

  static getClassName = (): string => 'CancelTradeHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'CancelTransaction') {
      return;
    }

    await this.cancelTradeUseCase.execute(event.id);
  }
}
