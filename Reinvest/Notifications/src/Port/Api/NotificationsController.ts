import { CreateNotification } from 'Notifications/UseCase/CreateNotification';

export class NotificationsController {
  private createNotificationUseCase: CreateNotification;

  constructor(createNotificationUseCase: CreateNotification) {
    this.createNotificationUseCase = createNotificationUseCase;
  }

  static getClassName = () => 'NotificationsController';

  async createNotification(): Promise<boolean> {
    try {
      return true;
    } catch (error: any) {
      console.error('[NotificationsController] createNotification', error);

      return false;
    }
  }
}
