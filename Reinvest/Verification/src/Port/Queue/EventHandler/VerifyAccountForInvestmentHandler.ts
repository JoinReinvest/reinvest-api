import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';

export class VerifyAccountForInvestmentHandler implements EventHandler<DomainEvent> {
  private verifyAccountUseCase: VerifyAccount;
  private eventBus: EventBus;

  constructor(verifyAccountUseCase: VerifyAccount, eventBus: EventBus) {
    this.verifyAccountUseCase = verifyAccountUseCase;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'VerifyAccountForInvestmentHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'VerifyAccountForInvestment') {
      return;
    }

    const profileId = event.data.profileId;
    const accountId = event.data.accountId;
    const decision = await this.verifyAccountUseCase.verify(profileId, accountId);

    let returnEvent: DomainEvent = {
      kind: 'AccountNotVerifiedForInvestment',
      data: {
        accountId,
        profileId,
      },
      id: event.id,
    };
    console.log('decision', decision);

    if (decision.canUserContinueTheInvestment) {
      returnEvent = {
        kind: 'AccountVerifiedForInvestment',
        data: {
          accountId: accountId,
        },
        id: event.id,
      };
    } // TODO else check if banned

    await this.eventBus.publish(returnEvent);
  }
}
