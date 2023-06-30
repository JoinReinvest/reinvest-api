import { Pagination, UUID } from 'HKEKTypes/Generics';
import { AccountActivitiesRepository } from 'Notifications/Adapter/Database/Repository/AccountActivitiesRepository';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { ProcessStoredEvent } from 'Notifications/Application/UseCase/ProcessStoredEvent';

export class StoredEventsController {
  private accountActivitiesRepository: AccountActivitiesRepository;

  constructor(
    storedEventsRepository: StoredEventRepository,
    processStoredEventUseCase: ProcessStoredEvent,
    accountActivitiesRepository: AccountActivitiesRepository,
  ) {
    this.storedEventsRepository = storedEventsRepository;
    this.processStoredEventUseCase = processStoredEventUseCase;
    this.accountActivitiesRepository = accountActivitiesRepository;
  }

  static getClassName = () => 'StoredEventsController';
  private storedEventsRepository: StoredEventRepository;
  private processStoredEventUseCase: ProcessStoredEvent;

  async listStoredEventsIds() {
    return this.storedEventsRepository.listStoredEventsIds();
  }

  async processStoredEvent(storedEventId: string) {
    return this.processStoredEventUseCase.execute(storedEventId);
  }

  async listAccountActivities(profileId: UUID, accountId: UUID, pagination: Pagination) {
    const activities = await this.accountActivitiesRepository.listActivities(profileId, accountId, pagination);

    return activities.map(activity => activity.getView());
  }
}
