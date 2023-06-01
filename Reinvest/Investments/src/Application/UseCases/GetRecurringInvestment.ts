import type { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

class GetRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'GetRecurringInvestment';

  async execute(accountId: string, status1: RecurringInvestmentStatus) {
    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, status1);

    if (!recurringInvestment) {
      return false;
    }

    const { id, startDate, frequency, subscriptionAgreementId, status } = recurringInvestment.toObject();

    return {
      id,
      schedule: {
        startDate,
        frequency,
      },
      amount: recurringInvestment.getAmount(),
      subscriptionAgreementId,
      status,
    };
  }
}

export default GetRecurringInvestment;
