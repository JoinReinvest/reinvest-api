import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";
import {SimpleEventBus} from "SimpleAggregator/EventBus/EventBus";
import {ProfileQueryEventHandler} from "InvestmentAccounts/EventHandlers";

export default class EventBusProvider {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(ProfileQueryEventHandler, [])


        const eventBus = new SimpleEventBus(container);
        eventBus
            .subscribe('ProfileSnapshotChanged', ProfileQueryEventHandler.getClassName())
        ;

        container.addAsValue(SimpleEventBus.getClassName(), eventBus);
    }
}
