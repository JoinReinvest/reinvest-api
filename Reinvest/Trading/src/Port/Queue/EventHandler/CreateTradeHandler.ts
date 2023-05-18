import { EventBus, EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { CreateTrade } from 'Trading/IntegrationLogic/UseCase/CreateTrade';

export class CreateTradeHandler implements EventHandler<DomainEvent> {
  private createTradeUseCase: CreateTrade;
  private eventBus: EventBus;

  constructor(createTradeUseCase: CreateTrade, eventBus: EventBus) {
    this.createTradeUseCase = createTradeUseCase;
    this.eventBus = eventBus;
  }

  static getClassName = (): string => 'CreateTradeHandler';

  public async handle(event: DomainEvent): Promise<void> {
    console.log('yep, I am in the trading module');
    // if (event.kind !== 'VerifyAccountForInvestment') {
    //   return;
    // }
    //
    // const profileId = event.data.profileId;
    // const accountId = event.data.accountId;
    // const decision = await this.verifyAccountUseCase.verify(profileId, accountId);
    //
    // if (decision.canUserContinueTheInvestment) {
    //   await this.eventBus.publish({
    //     kind: 'AccountVerifiedForInvestment',
    //     data: {
    //       accountId: accountId,
    //     },
    //     id: event.id,
    //   });
    // }
  }
}
