import { ContainerInterface } from "Container/Container";
import { InvestmentAccounts } from "Reinvest/InvestmentAccounts/bootstrap";
import ProfileQuery, {
  QueryProfileRepository,
} from "Reinvest/InvestmentAccounts/ProfileQuery";

export default class QueryProviders {
  private config: InvestmentAccounts.Config;

  constructor(config: InvestmentAccounts.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addClass(QueryProfileRepository)
      .addClass(ProfileQuery, [QueryProfileRepository.toString()]);
  }
}
