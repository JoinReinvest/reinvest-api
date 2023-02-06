import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";
import {CreateProfileController} from "InvestmentAccounts/Infrastructure/Controller/CreateProfileController";
import {ProfileRepository} from "InvestmentAccounts/ProfileService";

export default class PortsProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(CreateProfileController, [ProfileRepository]);
    }
}
