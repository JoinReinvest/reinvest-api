import { UUID } from 'HKEKTypes/Generics';
import { RecurringInvestmentExecutionRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestmentExecutionRepository';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class SuspendRecurringInvestment {
  static getClassName = (): string => 'SuspendRecurringInvestment';
  private recurringInvestmentRepository: RecurringInvestmentsRepository;
  private recurringInvestmentExecutionRepository: RecurringInvestmentExecutionRepository;

  constructor(recurringInvestmentRepository: RecurringInvestmentsRepository, recurringInvestmentExecutionRepository: RecurringInvestmentExecutionRepository) {
    this.recurringInvestmentRepository = recurringInvestmentRepository;
    this.recurringInvestmentExecutionRepository = recurringInvestmentExecutionRepository;
  }

  async execute(recurringInvestmentId: UUID) {
    const NUMBER_OF_EXECUTIONS_TO_FAIL_TO_SUSPEND_RECURRING_INVESTMENT = 2;
    const lastExecutions = await this.recurringInvestmentExecutionRepository.getLastExecutions(
      recurringInvestmentId,
      NUMBER_OF_EXECUTIONS_TO_FAIL_TO_SUSPEND_RECURRING_INVESTMENT,
    );

    if (lastExecutions.length < NUMBER_OF_EXECUTIONS_TO_FAIL_TO_SUSPEND_RECURRING_INVESTMENT) {
      return;
    }

    const isFailed = lastExecutions.every(execution => execution.isPaymentFailed());

    if (!isFailed) {
      return;
    }

    const recurringInvestment = await this.recurringInvestmentRepository.getRecurringInvestmentById(recurringInvestmentId);

    if (!recurringInvestment) {
      return;
    }

    recurringInvestment.suspend();

    const { profileId } = recurringInvestment.toObject();
    await this.recurringInvestmentRepository.store(recurringInvestment, [
      storeEventCommand(profileId, 'RecurringInvestmentSuspended', {
        reason: 'Too many consecutive failed payments',
        ...recurringInvestment.forEvent(),
      }),
    ]);
  }
}
