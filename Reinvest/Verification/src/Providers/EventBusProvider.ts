import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { Verification } from 'Verification/index';
import { VerifyAccount } from 'Verification/IntegrationLogic/UseCase/VerifyAccount';
import { VerifyAccountForInvestmentHandler } from 'Verification/Port/Queue/EventHandler/VerifyAccountForInvestmentHandler';

export default class EventBusProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(VerifyAccountForInvestmentHandler, [VerifyAccount, SimpleEventBus]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), ['AccountVerifiedForInvestment']);
  }
}
