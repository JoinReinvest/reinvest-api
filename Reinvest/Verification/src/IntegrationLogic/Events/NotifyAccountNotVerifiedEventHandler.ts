import { EventBus, EventHandler, storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class NotifyAccountNotVerifiedEventHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'NotifyAccountNotVerifiedEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (!['AccountNotVerifiedForInvestment', 'PrincipalVerificationNeedsMoreInfo'].includes(event.kind)) {
      return;
    }

    const {
      id,
      kind,
      data: { profileId, accountId },
    } = event;

    const type = ['AccountNotVerifiedForInvestment', 'AccountVerifiedForInvestment'].includes(kind) ? 'verification' : 'principal-verification';
    const uniqueId = `${id}-${type}`;

    const storedEvent = storeEventCommand(profileId, 'VerificationFailed', {
      accountId: accountId,
      uniqueId: uniqueId,
    });

    await this.eventBus.publish(storedEvent);
  }
}
