import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { TransferSharesForReinvestment } from 'Trading/IntegrationLogic/UseCase/TransferSharesForReinvestment';

export class TransferSharesForReinvestmentHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;
  private transferSharesForReinvestment: TransferSharesForReinvestment;

  constructor(transferSharesForReinvestment: TransferSharesForReinvestment, eventBus: EventBus) {
    this.eventBus = eventBus;
    this.transferSharesForReinvestment = transferSharesForReinvestment;
  }

  static getClassName = (): string => 'TransferSharesForReinvestmentHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'TransferSharesForReinvestment') {
      return;
    }

    const dividendId = event.id;
    const { accountId, profileId, portfolioId, amount } = event.data;
    const tradeSummary = await this.transferSharesForReinvestment.execute({
      dividendId,
      accountId,
      profileId,
      portfolioId,
      amount,
    });

    if (tradeSummary) {
      const { shares, unitSharePrice } = tradeSummary;
      await this.eventBus.publish({
        kind: 'ReinvestmentSharesTransferred',
        id: dividendId,
        data: {
          shares,
          unitSharePrice,
        },
      });
    }
  }
}
