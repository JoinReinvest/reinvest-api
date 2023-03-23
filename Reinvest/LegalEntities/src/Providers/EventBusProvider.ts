import {ContainerInterface} from "Container/Container";
import {EventBus, SimpleEventBus} from "SimpleAggregator/EventBus/EventBus";
import {LegalEntities} from "LegalEntities/index";
import {SendToQueueEventHandler} from "SimpleAggregator/EventBus/SendToQueueEventHandler";
import {LegalProfileCompleted} from "LegalEntities/Domain/Events/ProfileEvents";

export default class EventBusProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;

        eventBus
            .subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [
                "LegalProfileCompleted",
            ]);
        ;

    }
}
