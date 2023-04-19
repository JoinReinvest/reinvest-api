import { ContainerInterface } from 'Container/Container';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { ProfileQueryEventHandler } from 'InvestmentAccounts/Infrastructure/Events/EventHandlers';
import { ProfileQuery } from 'InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export default class EventBusProvider {
  private config: InvestmentAccounts.Config;

  constructor(config: InvestmentAccounts.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(ProfileQueryEventHandler, [ProfileQuery]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    // eventBus
    //     .subscribe('ProfileSnapshotChanged', ProfileQueryEventHandler.getClassName())
    eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), ['IndividualAccountOpened', 'CorporateAccountOpened', 'TrustAccountOpened']);
  }
}
