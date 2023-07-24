import { UUID } from 'HKEKTypes/Generics';
import { RecurringInvestmentStatus } from 'Investments/Domain/Investments/Types';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

class InitiateRecurringInvestment {
  private readonly recurringInvestmentsRepository: RecurringInvestmentsRepository;

  constructor(recurringInvestmentsRepository: RecurringInvestmentsRepository) {
    this.recurringInvestmentsRepository = recurringInvestmentsRepository;
  }

  static getClassName = (): string => 'InitiateRecurringInvestment';

  async execute(profileId: UUID, accountId: string) {
    const recurringInvestmentDraft = await this.recurringInvestmentsRepository.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.DRAFT);

    if (!recurringInvestmentDraft) {
      return false;
    }

    const isReady = recurringInvestmentDraft.isReadyToActivate();

    if (!isReady) {
      return false;
    }

    const events: DomainEvent[] = [];
    const activeRecurringInvestment = await this.recurringInvestmentsRepository.getRecurringInvestment(profileId, accountId, RecurringInvestmentStatus.ACTIVE);

    if (activeRecurringInvestment) {
      activeRecurringInvestment.deactivate();

      await this.recurringInvestmentsRepository.updateStatus(activeRecurringInvestment);
      events.push(storeEventCommand(profileId, 'RecurringInvestmentDeactivated', activeRecurringInvestment.forEvent()));
    }

    recurringInvestmentDraft?.activate();
    const status = await this.recurringInvestmentsRepository.updateStatus(recurringInvestmentDraft);

    events.push(storeEventCommand(profileId, 'RecurringInvestmentCreated', recurringInvestmentDraft.forEvent()));
    await this.recurringInvestmentsRepository.publishEvents(events);

    return status;
  }
}

export default InitiateRecurringInvestment;
