import { Pagination, UUID } from 'HKEKTypes/Generics';
import type { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';

export type RecurringInvestmentView = {
  amount: {
    formatted: string;
    value: number;
  };
  id: UUID;
  nextInvestmentDate: string;
  schedule: {
    frequency: string;
    startDate: string;
  };
  status: RecurringInvestmentStatus;
  subscriptionAgreementId: UUID | null;
};

class RecurringInvestmentQuery {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'RecurringInvestmentQuery';

  async getRecurringInvestment(
    profileId: UUID,
    accountId: string,
    recurringInvestmentStatus: RecurringInvestmentStatus,
  ): Promise<RecurringInvestmentView | null> {
    const recurringInvestment = await this.recurringInvestmentsRepository.getRecurringInvestment(profileId, accountId, recurringInvestmentStatus);

    if (!recurringInvestment) {
      return null;
    }

    const { id, subscriptionAgreementId, status, startDate, nextDate, frequency } = recurringInvestment.toObject();

    return {
      id,
      schedule: {
        startDate: startDate.toIsoDate(),
        frequency,
      },
      nextInvestmentDate: nextDate.toIsoDate(),
      amount: recurringInvestment.getAmount(),
      subscriptionAgreementId,
      status,
    };
  }

  async listRecurringInvestmentsReadyToExecute(pagination: Pagination): Promise<
    {
      accountId: UUID;
      id: UUID;
      profileId: UUID;
    }[]
  > {
    return this.recurringInvestmentsRepository.getActiveRecurringInvestmentReadyToExecute(pagination);
  }
}

export default RecurringInvestmentQuery;
