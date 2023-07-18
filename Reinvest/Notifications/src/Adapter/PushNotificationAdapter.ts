import { QueueSender } from 'shared/hkek-sqs/QueueSender';

export type PushNotification = {
  body: string;
  title: string;
  token: string;
};

export class PushNotificationAdapter {
  public static getClassName = (): string => 'PushNotificationAdapter';
  private pushNotificationQueueSender: QueueSender;

  constructor(pushNotificationQueueSender: QueueSender) {
    this.pushNotificationQueueSender = pushNotificationQueueSender;
  }

  async sendNotification(pushNotificationData: PushNotification): Promise<void> {
    await this.pushNotificationQueueSender.send(JSON.stringify(pushNotificationData));
  }
}
