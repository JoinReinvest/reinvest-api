import { ReinvestmentProcessManager } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentProcessManager';
import { transferSharesForReinvestment } from 'Investments/Domain/Reinvestments/ReinvestmentCommands';
import { ReinvestmentDecisions, TransferReinvestmentSharesDecision } from 'Investments/Domain/Reinvestments/ReinvestmentDecisions';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class ReinvestmentExecutor {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'ReinvestmentExecutor';

  async execute(reinvestment: ReinvestmentProcessManager): Promise<void> {
    const decision = reinvestment.makeDecision();
    console.log(decision);

    if ([ReinvestmentDecisions.TRANSFER_SHARES_FOR_REINVESTMENT].includes(decision.kind)) {
      await this.eventBus.publish(transferSharesForReinvestment(decision as TransferReinvestmentSharesDecision));

      return;
    }
  }
}
