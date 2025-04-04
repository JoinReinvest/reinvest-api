import { ContainerInterface } from 'Container/Container';
import CreateProfile from 'InvestmentAccounts/Application/CreateProfile';
import { OpenAccount } from 'InvestmentAccounts/Application/OpenAccount';
import { RemoveBeneficiary } from 'InvestmentAccounts/Application/RemoveBeneficiary';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { AccountManagementController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/AccountManagementController';
import { CreateProfileController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/CreateProfileController';

export default class PortsProviders {
  private config: InvestmentAccounts.Config;

  constructor(config: InvestmentAccounts.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateProfileController, [CreateProfile]).addSingleton(AccountManagementController, [OpenAccount, RemoveBeneficiary]);
  }
}
