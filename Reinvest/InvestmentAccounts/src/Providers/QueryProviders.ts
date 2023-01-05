import { ContainerInterface } from "Container/Container";
import { InvestmentAccounts } from "InvestmentAccounts/index";
import ProfileQueryService, {
  QueryProfileRepository,
} from "InvestmentAccounts/ProfileQueryService";

export default class QueryProviders {
  private config: InvestmentAccounts.Config;

  constructor(config: InvestmentAccounts.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addClass(QueryProfileRepository)
      .addClass(ProfileQueryService, [QueryProfileRepository.toString()]);
  }
}
