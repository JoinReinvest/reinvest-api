import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class SendToQueueEventHandler implements EventHandler<DomainEvent> {
  static getClassName = (): string => 'SendToQueueEventHandler';
  private queueSender: QueueSender;

  constructor(queueSender: QueueSender) {
    this.queueSender = queueSender;
  }

  async handle(event: DomainEvent): Promise<void> {
    const message = JSON.stringify(event);

    console.info(`Sending event: ${event.kind}`);
    await this.queueSender.send(message, 2);
  }
}
