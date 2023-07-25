import { ContainerInterface } from 'Container/Container';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { IncentiveRewardEventHandler } from 'SharesAndDividends/Port/Queue/IncentiveRewardEventHandler';
import { LockedCalculatedDividendEventHandler } from 'SharesAndDividends/Port/Queue/LockedCalculatedDividendEventHandler';
import { NavUpdateEventHandler } from 'SharesAndDividends/Port/Queue/NavUpdateEventHandler';
import { ChangeLockedCalculatedDividendStatus } from 'SharesAndDividends/UseCase/ChangeLockedCalculatedDividendStatus';
import { GiveIncentiveRewardIfRequirementsAreMet } from 'SharesAndDividends/UseCase/GiveIncentiveRewardIfRequirementsAreMet';
import { EventBus, SimpleEventBus, STORE_EVENT_COMMAND } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export default class EventBusProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(NavUpdateEventHandler, [FinancialOperationsRepository]);
    container.addSingleton(IncentiveRewardEventHandler, [GiveIncentiveRewardIfRequirementsAreMet]);
    container.addSingleton(LockedCalculatedDividendEventHandler, [ChangeLockedCalculatedDividendStatus]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus
      .subscribe('SharesSettled', IncentiveRewardEventHandler.getClassName())
      .subscribeHandlerForKinds(LockedCalculatedDividendEventHandler.getClassName(), ['SharesSettled', 'SharesRevoked'])
      .subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [STORE_EVENT_COMMAND]);
  }
}
