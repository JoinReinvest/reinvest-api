import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';

export class CreateNotification {
  private notificationsRepository: NotificationsRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(notificationsRepository: NotificationsRepository, idGenerator: IdGeneratorInterface) {
    this.notificationsRepository = notificationsRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'CreateNotification';

  async execute(): Promise<void> {}
}
