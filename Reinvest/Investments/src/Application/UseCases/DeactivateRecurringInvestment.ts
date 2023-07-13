import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { UUID } from 'HKEKTypes/Generics';

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
}

export default DeactivateRecurringInvestment;
