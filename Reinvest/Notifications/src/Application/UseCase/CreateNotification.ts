import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';
import { Notification, NotificationsType } from 'Notifications/Domain/Notification';

export type CreateNewNotificationInput = {
  accountId: string | null;
  body: string;
  dismissId: string | null;
  header: string;
  notificationType: NotificationsType;
  onObjectId: string | null;
  onObjectType: string | null;
  profileId: string;
  uniqueId: string | null;
};

export class CreateNotification {
  private notificationsRepository: NotificationsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(notificationsRepository: NotificationsRepository, idGenerator: IdGeneratorInterface) {
    this.notificationsRepository = notificationsRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'CreateNotification';

  async execute(newNotificationInput: CreateNewNotificationInput): Promise<void> {
    const id = this.idGenerator.createUuid();
    const notificationInput = {
      ...newNotificationInput,
      id,
      dismissId: newNotificationInput.dismissId ?? id,
    };

    const notification = Notification.create(notificationInput);

    await this.notificationsRepository.store(notification);
  }
}
