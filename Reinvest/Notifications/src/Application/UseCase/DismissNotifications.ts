import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';

export class DismissNotifications {
  private notificationsRepository: NotificationsRepository;

  constructor(notificationsRepository: NotificationsRepository) {
    this.notificationsRepository = notificationsRepository;
  }

  static getClassName = () => 'DismissNotifications';

  async execute(profileId: string, dismissIds: string[]): Promise<void> {
    if (dismissIds.length === 0) {
      return;
    }

    await this.notificationsRepository.setReadToTrue(profileId, dismissIds);
  }
}
