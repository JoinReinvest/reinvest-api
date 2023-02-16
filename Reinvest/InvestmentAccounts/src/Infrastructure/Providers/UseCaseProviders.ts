import {ContainerInterface} from "Container/Container";
import {InvestmentAccounts} from "InvestmentAccounts/index";

import CreateProfile from "InvestmentAccounts/Application/CreateProfile";
import {ProfileRepository} from "InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository";

export default class UseCaseProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(CreateProfile, [ProfileRepository]);
    }
}
