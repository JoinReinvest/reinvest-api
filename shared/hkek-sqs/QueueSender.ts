import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

export type QueueConfig = {
  isLocal: boolean;
  queueUrl: string;
  region: string;
};

export class QueueSender {
  static getClassName = (): string => 'QueueSender';
  private sqs: SQSClient;
  private queueUrl: string;

  constructor(config: QueueConfig) {
    const { region, queueUrl, isLocal } = config;
    this.queueUrl = queueUrl;
    const SQSConfig = {
      region,
    };

    if (isLocal) {
      // @ts-ignore
      SQSConfig.endpoint = 'http://localhost:9324';
    }

    this.sqs = new SQSClient(SQSConfig);
  }

  async send(message: string, delay: number | null = null): Promise<void> {
    const params = {
      MessageBody: message,
      QueueUrl: this.queueUrl,
    };

    if (delay) {
      // @ts-ignore
      params['DelaySeconds'] = delay;
    }

    try {
      await this.sqs.send(new SendMessageCommand(params));
    } catch (error: any) {
      console.error(error.message);
    }
  }
}
