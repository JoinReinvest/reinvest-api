import { SuspendRecurringInvestment } from 'Investments/Application/UseCases/SuspendRecurringInvestment';
import { TransactionEvent, TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { RecurringInvestmentExecutionRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestmentExecutionRepository';

export class RecurringInvestmentStatusEventHandler {
  static getClassName = (): string => 'RecurringInvestmentStatusEventHandler';

  private recurringInvestmentExecutionRepository: RecurringInvestmentExecutionRepository;
  private suspendRecurringInvestmentUseCase: SuspendRecurringInvestment;

  constructor(recurringInvestmentExecutionRepository: RecurringInvestmentExecutionRepository, suspendRecurringInvestmentUseCase: SuspendRecurringInvestment) {
    this.recurringInvestmentExecutionRepository = recurringInvestmentExecutionRepository;
    this.suspendRecurringInvestmentUseCase = suspendRecurringInvestmentUseCase;
  }

  async handle(event: TransactionEvent): Promise<void> {
    if (
      ![
        TransactionEvents.INVESTMENT_FUNDED,
        TransactionEvents.INVESTMENT_CANCELED,
        TransactionEvents.TRANSACTION_REVERTED,
        TransactionEvents.INVESTMENT_FINISHED,
        TransactionEvents.SECOND_PAYMENT_FAILED,
      ].includes(event.kind)
    ) {
      return;
    }

    const investmentId = event.id;
    const investmentExecution = await this.recurringInvestmentExecutionRepository.getByInvestmentId(investmentId);

    if (!investmentExecution) {
      return;
    }

    switch (event.kind) {
      case TransactionEvents.INVESTMENT_FUNDED:
        investmentExecution.paymentSucceeded();
        break;
      case TransactionEvents.INVESTMENT_CANCELED:
        investmentExecution.canceled();
        break;
      case TransactionEvents.SECOND_PAYMENT_FAILED:
        investmentExecution.paymentFailed();
        await this.recurringInvestmentExecutionRepository.store(investmentExecution);
        await this.suspendRecurringInvestmentUseCase.execute(investmentExecution.getRecurringId());

        return;
      case TransactionEvents.TRANSACTION_REVERTED:
        investmentExecution.failed();
        break;
      case TransactionEvents.INVESTMENT_FINISHED:
        investmentExecution.completed();
        break;
      default:
        return;
    }

    await this.recurringInvestmentExecutionRepository.store(investmentExecution);
  }
}
