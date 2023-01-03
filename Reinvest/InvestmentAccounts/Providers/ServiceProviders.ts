import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "Reinvest/InvestmentAccounts/bootstrap";
import ProfileService, {ProfileRepository} from "Reinvest/InvestmentAccounts/ProfileService";

export default class ServiceProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(ProfileRepository)
            .addClass(ProfileService, [
                ProfileRepository.toString()
            ]);
    }
}