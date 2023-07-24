import { DateTime } from 'Money/DateTime';
import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { RetryPayment } from 'Trading/IntegrationLogic/UseCase/RetryPayment';

export class RetryPaymentHandler implements EventHandler<DomainEvent> {
  static getClassName = (): string => 'RetryPaymentHandler';

  private retryPaymentUseCase: RetryPayment;
  private eventBus: EventBus;

  constructor(retryPaymentUseCase: RetryPayment, eventBus: EventBus) {
    this.retryPaymentUseCase = retryPaymentUseCase;
    this.eventBus = eventBus;
  }

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'RetryPayment') {
      return;
    }

    const investmentId = event.id;
    const retryAfterDate = DateTime.from(event.data.retryAfterDate);

    if (await this.retryPaymentUseCase.execute(investmentId, retryAfterDate)) {
      await this.eventBus.publish({
        kind: 'PaymentRetried',
        id: event.id,
      });
    }
  }
}
