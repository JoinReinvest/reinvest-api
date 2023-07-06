import ScheduleInvestmentService from 'Investments/Application/Service/ScheduleInvestmentService';
import type { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { UUID } from 'HKEKTypes/Generics';

class RecurringInvestmentQuery {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'RecurringInvestmentQuery';

  async execute(profileId: UUID, accountId: string, recurringInvestmentStatus: RecurringInvestmentStatus) {
    const recurringInvestment = await this.recurringInvestmentsRepository.get(profileId, accountId, recurringInvestmentStatus);

    if (!recurringInvestment) {
      return false;
    }

    const { id, subscriptionAgreementId, status } = recurringInvestment.toObject();

    const { startDate, frequency } = recurringInvestment.getSchedule();

    const scheduleInvestmentService = new ScheduleInvestmentService(startDate, frequency);

    return {
      id,
      schedule: {
        startDate,
        frequency,
      },
      nextInvestmentDate: scheduleInvestmentService.getNextInvestmentDate(),
      amount: recurringInvestment.getAmount(),
      subscriptionAgreementId,
      status,
    };
  }
}

export default RecurringInvestmentQuery;
