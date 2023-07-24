import { Pagination, UUID } from 'HKEKTypes/Generics';
import { AccountActivitiesRepository } from 'Notifications/Adapter/Database/Repository/AccountActivitiesRepository';
import { PushNotificationRepository } from 'Notifications/Adapter/Database/Repository/PushNotificationRepository';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { ProcessStoredEvent } from 'Notifications/Application/UseCase/ProcessStoredEvent';

export class StoredEventsController {
  private accountActivitiesRepository: AccountActivitiesRepository;
  private pushNotificationRepository: PushNotificationRepository;

  constructor(
    storedEventsRepository: StoredEventRepository,
    processStoredEventUseCase: ProcessStoredEvent,
    accountActivitiesRepository: AccountActivitiesRepository,
    pushNotificationRepository: PushNotificationRepository,
  ) {
    this.storedEventsRepository = storedEventsRepository;
    this.processStoredEventUseCase = processStoredEventUseCase;
    this.accountActivitiesRepository = accountActivitiesRepository;
    this.pushNotificationRepository = pushNotificationRepository;
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

  async registerPushNotificationDevice(profileId: UUID, deviceId: UUID): Promise<boolean> {
    return this.pushNotificationRepository.registerDevice(profileId, deviceId);
  }
}
