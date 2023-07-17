import { UUID } from 'HKEKTypes/Generics';
import { IdentityService } from 'Identity/Adapter/Module/IdentityService';
import { AccountActivitiesRepository } from 'Notifications/Adapter/Database/Repository/AccountActivitiesRepository';
import { PushNotificationRepository } from 'Notifications/Adapter/Database/Repository/PushNotificationRepository';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { EmailSender } from 'Notifications/Adapter/SES/EmailSender';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { AccountActivity } from 'Notifications/Domain/AccountActivity';
import { StoredEvent } from 'Notifications/Domain/StoredEvent';

export class ProcessStoredEvent {
  private storedEventRepository: StoredEventRepository;
  private accountActivitiesRepository: AccountActivitiesRepository;
  private createNotificationUseCase: CreateNotification;
  private pushNotificationRepository: PushNotificationRepository;
  private identityService: IdentityService;
  private emailSender: EmailSender;

  constructor(
    storedEventRepository: StoredEventRepository,
    accountActivitiesRepository: AccountActivitiesRepository,
    createNotificationUseCase: CreateNotification,
    pushNotificationRepository: PushNotificationRepository,
    identityService: IdentityService,
    emailSender: EmailSender,
  ) {
    this.storedEventRepository = storedEventRepository;
    this.accountActivitiesRepository = accountActivitiesRepository;
    this.createNotificationUseCase = createNotificationUseCase;
    this.pushNotificationRepository = pushNotificationRepository;
    this.identityService = identityService;
    this.emailSender = emailSender;
  }

  static getClassName = () => 'ProcessStoredEvent';

  async execute(storedEventId: UUID): Promise<void> {
    const storedEvent = await this.storedEventRepository.getById(storedEventId);

    if (!storedEvent) {
      return;
    }

    const globalValues = await this.identityService.getUserData(storedEvent.getProfileId());
    storedEvent.setGlobalValues(globalValues);

    const statuses = [];
    statuses.push(await this.processAccountActivity(storedEvent));
    statuses.push(await this.processInAppNotification(storedEvent));
    statuses.push(await this.processEmailNotification(storedEvent));
    statuses.push(await this.processPushNotification(storedEvent));
    statuses.push(await this.processAnalyticEvent(storedEvent));

    statuses.every(status => status) ? storedEvent.markAsProcessed() : storedEvent.markAsFailed();
    await this.storedEventRepository.store(storedEvent);
  }

  private async processAccountActivity(storedEvent: StoredEvent): Promise<boolean> {
    if (!storedEvent.shouldProcessAccountActivity()) {
      return true;
    }

    try {
      const { name, data, date, profileId, accountId } = storedEvent.getAccountActivity();
      const accountActivity = AccountActivity.create(profileId, accountId, name, date, data);
      await this.accountActivitiesRepository.store(accountActivity);

      storedEvent.markAccountActivityAsProcessed();
      await this.storedEventRepository.store(storedEvent);

      return true;
    } catch (error: any) {
      console.error(`Cannot process account activity for stored event ${storedEvent.getId()}`, error);

      return false;
    }
  }

  private async processInAppNotification(storedEvent: StoredEvent): Promise<boolean> {
    if (!storedEvent.shouldProcessInApp()) {
      return true;
    }

    try {
      const notification = storedEvent.getNotification();
      await this.createNotificationUseCase.execute(notification);

      storedEvent.markInAppAsProcessed();
      await this.storedEventRepository.store(storedEvent);

      return true;
    } catch (error: any) {
      console.error(`Cannot process in-app notification for stored event ${storedEvent.getId()}`, error);

      return false;
    }
  }

  private async processEmailNotification(storedEvent: StoredEvent): Promise<boolean> {
    if (!storedEvent.shouldProcessEmail()) {
      return true;
    }

    const email = storedEvent.getUserEmail();

    if (!email) {
      console.error(`Cannot process email notification for stored event ${storedEvent.getProfileId()}/${storedEvent.getId()}: no email`);

      return false;
    }

    // const { subject, body } = storedEvent.getEmailNotification();

    storedEvent.markEmailAsProcessed();

    return true;
  }

  private async processPushNotification(storedEvent: StoredEvent): Promise<boolean> {
    if (!storedEvent.shouldProcessPush()) {
      return true;
    }

    try {
      const { profileId, title, body } = storedEvent.getPushNotification();
      await this.pushNotificationRepository.pushNotification(profileId, title, body);

      storedEvent.markPushAsProcessed();
      await this.storedEventRepository.store(storedEvent);

      return true;
    } catch (error: any) {
      console.error(`Cannot process push notification for stored event ${storedEvent.getId()}`, error);

      return false;
    }
  }

  private async processAnalyticEvent(storedEvent: StoredEvent): Promise<boolean> {
    return true;
  }
}
