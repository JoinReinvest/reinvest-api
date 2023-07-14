import { UUID } from 'HKEKTypes/Generics';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

class DeactivateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'DeactivateRecurringInvestment';

  async execute(profileId: UUID, accountId: string) {
    const recurringInvestment = await this.recurringInvestmentsRepository.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.ACTIVE);

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

  async deactivateAllUserRecurringInvestments(profileId: UUID): Promise<boolean> {
    const recurringInvestments = await this.recurringInvestmentsRepository.getUserAllActiveRecurringInvestments(profileId);

    if (recurringInvestments.length === 0) {
      return false;
    }

    for (const recurringInvestment of recurringInvestments) {
      recurringInvestment?.deactivate();
      await this.recurringInvestmentsRepository.updateStatus(recurringInvestment);
    }

    return true;
  }
}

export default DeactivateRecurringInvestment;
