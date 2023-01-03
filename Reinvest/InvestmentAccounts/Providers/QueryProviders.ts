import ProfileQuery, {QueryProfileRepository} from "Reinvest/InvestmentAccounts/ProfileQuery";
import {InvestmentAccounts} from "Reinvest/InvestmentAccounts/bootstrap";
import {ContainerInterface} from "Container/Container";

export default class QueryProviders {
    private config: InvestmentAccounts.Config;

    constructor(config: InvestmentAccounts.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(QueryProfileRepository)
            .addClass(ProfileQuery, [
                QueryProfileRepository.toString()
            ]);
    }
}