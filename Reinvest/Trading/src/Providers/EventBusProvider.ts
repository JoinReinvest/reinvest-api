import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { Trading } from 'Trading/index';
import { CreateTrade } from 'Trading/IntegrationLogic/UseCase/CreateTrade';
import { CreateTradeHandler } from 'Trading/Port/Queue/EventHandler/CreateTradeHandler';

export default class EventBusProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateTradeHandler, [CreateTrade, SimpleEventBus]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    // eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), ['AccountVerifiedForInvestment']);
  }
}
