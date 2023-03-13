import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";
import {CreateProfileController} from "InvestmentAccounts/Infrastructure/Ports/Controller/CreateProfileController";
import CreateProfile from "InvestmentAccounts/Application/CreateProfile";
import {
    AccountManagementController
} from "InvestmentAccounts/Infrastructure/Ports/Controller/AccountManagementController";
import {OpenAccount} from "InvestmentAccounts/Application/OpenAccount";

export default class PortsProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(CreateProfileController, [CreateProfile])
            .addClass(AccountManagementController, [OpenAccount])
        ;
    }
}
