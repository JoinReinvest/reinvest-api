import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { CheckIsTradeApproved } from 'Trading/IntegrationLogic/UseCase/CheckIsTradeApproved';

export class CheckIsInvestmentApprovedHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;
  private checkIsTradeApprovedUseCase: CheckIsTradeApproved;

  constructor(checkIsTradeApprovedUseCase: CheckIsTradeApproved, eventBus: EventBus) {
    this.eventBus = eventBus;
    this.checkIsTradeApprovedUseCase = checkIsTradeApprovedUseCase;
  }

  static getClassName = (): string => 'CheckIsInvestmentApprovedHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'CheckIsInvestmentApproved') {
      return;
    }

    const investmentId = event.id;

    if (await this.checkIsTradeApprovedUseCase.execute(investmentId)) {
      await this.eventBus.publish({
        kind: 'InvestmentApproved',
        id: investmentId,
      });
    }
  }
}
