import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';
import { GiveIncentiveRewardIfRequirementsAreMet } from 'SharesAndDividends/UseCase/GiveIncentiveRewardIfRequirementsAreMet';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class IncentiveRewardEventHandler implements EventHandler<TransactionEvent> {
  private giveIncentiveRewardIfRequirementsAreMetUseCase: GiveIncentiveRewardIfRequirementsAreMet;

  constructor(giveIncentiveRewardIfRequirementsAreMetUseCase: GiveIncentiveRewardIfRequirementsAreMet) {
    this.giveIncentiveRewardIfRequirementsAreMetUseCase = giveIncentiveRewardIfRequirementsAreMetUseCase;
  }

  static getClassName = (): string => 'IncentiveRewardEventHandler';

  async handle(event: DomainEvent): Promise<void> {
    if (event.kind !== 'SharesSettled') {
      return;
    }

    const { profileId } = event.data;

    await this.giveIncentiveRewardIfRequirementsAreMetUseCase.execute(profileId);
  }
}
