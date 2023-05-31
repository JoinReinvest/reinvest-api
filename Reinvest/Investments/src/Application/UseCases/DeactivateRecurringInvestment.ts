import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

class DeactivateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'DeactivateRecurringInvestment';

  async execute(accountId: string) {
    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    recurringInvestment?.updateStatus(RecurringInvestmentStatus.INACTIVE);

    const id = recurringInvestment.getId();
    const recurringStatus = recurringInvestment.getStatus();

    const status = await this.recurringInvestmentsRepository.deactivate(id, recurringStatus);

    if (!status) {
      return false;
    }

    return true;
  }
}

export default DeactivateRecurringInvestment;
