import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { DomainEvent } from 'SimpleAggregator/Types';

class AssignSubscriptionAgreementToRecurringInvestment {
  static getClassName = (): string => 'AssignSubscriptionAgreementToRecurringInvestment';

  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  async execute(accountId: string, subscriptionAgreementId: string) {
    const events: DomainEvent[] = [];

    const recurringInvestment = await this.recurringInvestmentsRepository.get(accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestment) {
      return false;
    }

    recurringInvestment.assignSubscriptionAgreement(subscriptionAgreementId);

    const isAssigned = await this.recurringInvestmentsRepository.assignSubscriptionAgreementAndUpdateStatus(recurringInvestment);

    if (isAssigned) {
      events.push({
        id: subscriptionAgreementId,
        kind: 'RecurringInvestmentSubscriptionAgreementSigned',
      });

      await this.recurringInvestmentsRepository.publishEvents(events);
    }

    return isAssigned;
  }
}

export default AssignSubscriptionAgreementToRecurringInvestment;
