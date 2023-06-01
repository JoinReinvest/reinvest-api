import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

class InitiateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'InitiateRecurringInvestment';

  async execute(accountId: string) {
    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    const subscriptionAgreementId = recurringInvestment.getSubscriptionAgreeementId();

    if (!subscriptionAgreementId) {
      return false;
    }

    recurringInvestment?.updateStatus(RecurringInvestmentStatus.ACTIVE);

    const id = recurringInvestment.getId();

    const status = await this.recurringInvestmentsRepository.updateStatus(id, RecurringInvestmentStatus.ACTIVE);

    if (!status) {
      return false;
    }

    return true;
  }
}

export default InitiateRecurringInvestment;
