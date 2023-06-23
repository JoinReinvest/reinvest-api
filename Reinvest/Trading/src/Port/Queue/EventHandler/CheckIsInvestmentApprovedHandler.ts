import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { CheckIsTradeApproved } from 'Trading/IntegrationLogic/UseCase/CheckIsTradeApproved';

export class CheckIsInvestmentApprovedHandler implements EventHandler<DomainEvent> {
  private checkIsTradeApprovedUseCase: CheckIsTradeApproved;

  constructor(checkIsTradeApprovedUseCase: CheckIsTradeApproved) {
    this.checkIsTradeApprovedUseCase = checkIsTradeApprovedUseCase;
  }

  static getClassName = (): string => 'CheckIsInvestmentApprovedHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'CheckIsInvestmentApproved') {
      return;
    }

    const investmentId = event.id;

    await this.checkIsTradeApprovedUseCase.execute(investmentId);
  }
}
