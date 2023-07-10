import { TransactionProcessManager } from 'Investments/Application/TransactionProcessManager/TransactionProcessManager';
import {
  cancelTransaction,
  checkIfGracePeriodEnded,
  checkIsInvestmentApproved,
  checkIsInvestmentFunded,
  createTrade,
  finalizeInvestment,
  markFundsAsReadyToDisburse,
  transferSharesWhenTradeSettled,
  verifyAccountForInvestment,
} from 'Investments/Domain/Transaction/TransactionCommands';
import {
  CancelTransactionDecision,
  CheckIfGracePeriodEndedDecision,
  CheckIsInvestmentApprovedDecision,
  CheckIsInvestmentFundedDecision,
  CreateTradeDecision,
  FinalizeInvestmentDecision,
  MarkFundsAsReadyToDisburseDecision,
  TransactionDecisions,
  TransferSharesWhenTradeSettledDecision,
  VerifyAccountDecision,
} from 'Investments/Domain/Transaction/TransactionDecisions';
import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DateTime } from 'Money/DateTime';

export class TransactionExecutor {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'TransactionExecutor';

  async execute(transaction: TransactionProcessManager): Promise<void> {
    const decision = transaction.makeDecision();

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

    if ([TransactionDecisions.CHECK_IS_INVESTMENT_FUNDED].includes(decision.kind)) {
      await this.eventBus.publish(checkIsInvestmentFunded(decision as CheckIsInvestmentFundedDecision));

      return;
    }

    if ([TransactionDecisions.CHECK_IS_INVESTMENT_APPROVED].includes(decision.kind)) {
      await this.eventBus.publish(checkIsInvestmentApproved(decision as CheckIsInvestmentApprovedDecision));

      return;
    }

    if ([TransactionDecisions.CHECK_IF_GRACE_PERIOD_ENDED].includes(decision.kind)) {
      await this.eventBus.publish(checkIfGracePeriodEnded(decision as CheckIfGracePeriodEndedDecision));

      return;
    }

    if ([TransactionDecisions.MARK_FUNDS_AS_READY_TO_DISBURSE].includes(decision.kind)) {
      await this.eventBus.publish(markFundsAsReadyToDisburse(decision as MarkFundsAsReadyToDisburseDecision));

      return;
    }

    if ([TransactionDecisions.TRANSFER_SHARES_WHEN_TRADE_SETTLED].includes(decision.kind)) {
      await this.eventBus.publish(transferSharesWhenTradeSettled(decision as TransferSharesWhenTradeSettledDecision));

      return;
    }

    if ([TransactionDecisions.CANCEL_TRANSACTION].includes(decision.kind)) {
      await this.eventBus.publish(cancelTransaction(decision as CancelTransactionDecision));

      return;
    }

    if ([TransactionDecisions.FINISH_INVESTMENT].includes(decision.kind)) {
      await this.eventBus.publish(<TransactionEvent>{
        id: decision.investmentId,
        kind: TransactionEvents.INVESTMENT_FINISHED,
        data: {},
        date: DateTime.now().toDate(),
      });

      return;
    }
  }
}
