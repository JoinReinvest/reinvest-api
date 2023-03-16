import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";

import CreateProfile from "InvestmentAccounts/Application/CreateProfile";
import {ProfileRepository} from "InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository";
import {OpenAccount} from "InvestmentAccounts/Application/OpenAccount";

export default class UseCaseProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(OpenAccount, [ProfileRepository])
            .addClass(CreateProfile, [ProfileRepository])
        ;
    }
}
