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
      parentId: event.data.parentId,
      userTradeId: event.data.userTradeId,
    };
    const result = await this.createTradeUseCase.createTrade(tradeConfiguration);

    if (result.state === 'CREATED') {
      await this.eventBus.publish({
        kind: 'TradeCreated',
        data: {
          accountId: event.data.accountId,
          ...result.summary,
        },
        id: event.id,
      });
    }

    if (result.state === 'PAYMENT_MISMATCHED') {
      await this.eventBus.publish({
        kind: 'TradePaymentMismatched',
        data: {},
        id: event.id,
      });
    }
  }
}
