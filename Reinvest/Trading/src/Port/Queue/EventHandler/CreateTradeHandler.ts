import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { CreateTrade } from 'Trading/IntegrationLogic/UseCase/CreateTrade';

export class CreateTradeHandler implements EventHandler<DomainEvent> {
  private createTradeUseCase: CreateTrade;
  private eventBus: EventBus;

  constructor(createTradeUseCase: CreateTrade, eventBus: EventBus) {
    this.createTradeUseCase = createTradeUseCase;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'CreateTradeHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'CreateTrade') {
      return;
    }

    const tradeConfiguration = {
      accountId: event.data.accountId,
      profileId: event.data.profileId,
      amount: event.data.amount,
      fees: event.data.fees,
      ip: event.data.ip,
      investmentId: event.id,
      bankAccountId: event.data.bankAccountId,
      subscriptionAgreementId: event.data.subscriptionAgreementId,
      portfolioId: event.data.portfolioId,
    };
    const tradeSummary = await this.createTradeUseCase.createTrade(tradeConfiguration);

    if (tradeSummary) {
      await this.eventBus.publish({
        kind: 'TradeCreated',
        data: {
          accountId: event.data.accountId,
          ...tradeSummary,
        },
        id: event.id,
      });
    }
  }
}
