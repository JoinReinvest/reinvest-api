import { QueueSender } from 'shared/hkek-sqs/QueueSender';

export type AnalyticsCommand = {
  eventName: string;
  profileId: string;
  sendIdentity: boolean;
  data?: Record<string, any>;
  identityData?: Record<string, any>;
};

export class AnalyticsAdapter {
  public static getClassName = (): string => 'AnalyticsAdapter';
  private analyticsQueueSender: QueueSender;

  constructor(analyticsQueueSender: QueueSender) {
    this.analyticsQueueSender = analyticsQueueSender;
  }

  async send(analyticsData: AnalyticsCommand): Promise<void> {
    await this.analyticsQueueSender.send(JSON.stringify(analyticsData));
  }
}
