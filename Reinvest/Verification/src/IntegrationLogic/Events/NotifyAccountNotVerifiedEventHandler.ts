import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
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

    const command = {
      kind: 'CreateNotification',
      data: {
        accountId: accountId,
        profileId: profileId,
        notificationType: 'VERIFICATION_FAILED',
        header: 'Verification failed [COPY-TO-UPDATE]',
        body: 'Update your account information to continue investing.',
        dismissId: null,
        onObjectId: accountId,
        onObjectType: 'ACCOUNT',
        uniqueId: uniqueId,
      },
      id: event.id,
    };

    await this.eventBus.publish(command);
  }
}
