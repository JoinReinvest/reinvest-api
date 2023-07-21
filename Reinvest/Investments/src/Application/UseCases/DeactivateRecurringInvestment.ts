import { UUID } from 'HKEKTypes/Generics';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

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

    await this.recurringInvestmentsRepository.publishEvents([storeEventCommand(profileId, 'RecurringInvestmentDeactivated', recurringInvestment.forEvent())]);

    return true;
  }

  async deactivateAllUserRecurringInvestments(profileId: UUID): Promise<boolean> {
    const recurringInvestments = await this.recurringInvestmentsRepository.getUserAllActiveRecurringInvestments(profileId);

    if (recurringInvestments.length === 0) {
      return false;
    }

    const events: DomainEvent[] = [];

    for (const recurringInvestment of recurringInvestments) {
      recurringInvestment?.deactivate();
      await this.recurringInvestmentsRepository.updateStatus(recurringInvestment);
      events.push(storeEventCommand(profileId, 'RecurringInvestmentDeactivated', recurringInvestment.forEvent()));
    }

    await this.recurringInvestmentsRepository.publishEvents(events);

    return true;
  }
}

export default DeactivateRecurringInvestment;
