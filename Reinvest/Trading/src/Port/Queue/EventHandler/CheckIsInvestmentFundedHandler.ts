import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { CheckIsTradeFunded } from 'Trading/IntegrationLogic/UseCase/CheckIsTradeFunded';

export class CheckIsInvestmentFundedHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;
  private checkIsTradeFundedUseCase: CheckIsTradeFunded;

  constructor(checkIsTradeFundedUseCase: CheckIsTradeFunded, eventBus: EventBus) {
    this.eventBus = eventBus;
    this.checkIsTradeFundedUseCase = checkIsTradeFundedUseCase;
  }

  static getClassName = (): string => 'CheckIsInvestmentFundedHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'CheckIsInvestmentFunded') {
      return;
    }

    const investmentId = event.id;
    const paymentStatus = await this.checkIsTradeFundedUseCase.execute(investmentId);

    if (paymentStatus.status === 'success') {
      await this.eventBus.publish({
        kind: 'InvestmentFunded',
        id: investmentId,
      });
    }

    if (paymentStatus.status === 'failed') {
      await this.eventBus.publish({
        kind: 'InvestmentPaymentFailed',
        id: investmentId,
      });
    }

    if (paymentStatus.status === 'second-fail') {
      await this.eventBus.publish({
        kind: 'InvestmentPaymentSecondFailed',
        id: investmentId,
      });
    }
  }
}
