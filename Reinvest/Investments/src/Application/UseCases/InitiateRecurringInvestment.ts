import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

class InitiateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'InitiateRecurringInvestment';

  async execute(accountId: string) {
    const recurringInvestmentDraft = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestmentDraft) {
      return false;
    }

    const isReady = recurringInvestmentDraft.isReadyToActivate();

    if (!isReady) {
      return false;
    }

    const activeRecurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.ACTIVE);

    if (activeRecurringInvestment) {
      activeRecurringInvestment.deactivate();

      await this.recurringInvestmentsRepository.updateStatus(activeRecurringInvestment);
    }

    recurringInvestmentDraft?.activate();
    const status = await this.recurringInvestmentsRepository.updateStatus(recurringInvestmentDraft);

    return status;
  }
}

export default InitiateRecurringInvestment;
