import { TransactionProcessManager } from 'Investments/Application/TransactionProcessManager/TransactionProcessManager';
import { createTrade, finalizeInvestment, verifyAccountForInvestment } from 'Investments/Domain/Transaction/TransactionCommands';
import {
  CreateTradeDecision,
  FinalizeInvestmentDecision,
  TransactionDecisions,
  VerifyAccountDecision,
} from 'Investments/Domain/Transaction/TransactionDecisions';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';

export class TransactionExecutor {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'TransactionExecutor';

  async execute(transaction: TransactionProcessManager): Promise<void> {
    const decision = transaction.makeDecision();
    console.log(decision);

    if ([TransactionDecisions.VERIFY_ACCOUNT].includes(decision.kind)) {
      await this.eventBus.publish(verifyAccountForInvestment(decision as VerifyAccountDecision));

      return;
    }

    if ([TransactionDecisions.FINALIZE_INVESTMENT].includes(decision.kind)) {
      await this.eventBus.publish(finalizeInvestment(decision as FinalizeInvestmentDecision));

      return;
    }

    if ([TransactionDecisions.CREATE_TRADE].includes(decision.kind)) {
      await this.eventBus.publish(createTrade(decision as CreateTradeDecision));

      return;
    }
  }
}
