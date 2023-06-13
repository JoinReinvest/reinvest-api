import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

class DeactivateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'DeactivateRecurringInvestment';

  async execute(accountId: string) {
    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.ACTIVE);

    if (!recurringInvestment) {
      return false;
    }

    recurringInvestment?.deactivate();

    const status = await this.recurringInvestmentsRepository.updateStatus(recurringInvestment);

    if (!status) {
      return false;
    }

    return true;
  }
}

export default DeactivateRecurringInvestment;
