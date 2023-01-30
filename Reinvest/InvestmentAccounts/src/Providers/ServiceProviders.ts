import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";
import ProfileService, {
    ProfileRepository,
} from "InvestmentAccounts/ProfileService";
import {SimpleEventBus} from "SimpleAggregator/EventBus/EventBus";

export default class ServiceProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(ProfileRepository)
            .addClass(ProfileService, [ProfileRepository.getClassName(), SimpleEventBus.getClassName()]);
    }
}
