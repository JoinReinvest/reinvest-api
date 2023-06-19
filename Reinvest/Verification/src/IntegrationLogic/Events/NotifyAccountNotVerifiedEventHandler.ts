import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class NotifyAccountNotVerifiedEventHandler implements EventHandler<DomainEvent> {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'NotifyAccountNotVerifiedEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (!['AccountNotVerifiedForInvestment', 'AccountVerifiedForInvestment'].includes(event.kind)) {
      return;
    }

    const {
      id: investmentId,
      kind,
      data: { profileId, accountId },
    } = event;
    let command: DomainEvent;
    const uniqueId = `${investmentId}-verification`;

    if (kind === 'AccountNotVerifiedForInvestment') {
      command = {
        kind: 'CreateNotification',
        data: {
          accountId: accountId,
          profileId: profileId,
          notificationType: 'VERIFICATION_FAILED',
          header: 'Verification failed [COPY-TO-UPDATE]',
          body: 'Update your account information to continue investing.',
          dismissId: uniqueId,
          onObjectId: accountId,
          onObjectType: 'ACCOUNT',
          uniqueId: uniqueId,
        },
        id: event.id,
      };
    } else {
      command = {
        kind: 'DismissNotification',
        data: {
          profileId: profileId,
          dismissId: uniqueId,
        },
        id: event.id,
      };
    }

    await this.eventBus.publish(command);
  }
}
