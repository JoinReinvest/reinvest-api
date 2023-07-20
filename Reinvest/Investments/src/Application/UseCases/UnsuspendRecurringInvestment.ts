import { UUID } from 'HKEKTypes/Generics';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

class UnsuspendRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'UnsuspendRecurringInvestment';

  async execute(profileId: UUID, accountId: string) {
    const recurringInvestment = await this.recurringInvestmentsRepository.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.SUSPENDED);

    if (!recurringInvestment) {
      return false;
    }

    recurringInvestment?.activate();

    const status = await this.recurringInvestmentsRepository.updateStatus(recurringInvestment);

    if (!status) {
      return false;
    }

    return true;
  }
}

export default UnsuspendRecurringInvestment;
