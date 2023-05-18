import { ContainerInterface } from 'Container/Container';
import CreateConfiguration from 'InvestmentAccounts/Application/CreateConfiguration';
import CreateProfile from 'InvestmentAccounts/Application/CreateProfile';
import GetConfiguration from 'InvestmentAccounts/Application/GetConfiguration';
import { OpenAccount } from 'InvestmentAccounts/Application/OpenAccount';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { AccountManagementController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/AccountManagementController';
import { ConfigurationController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/ConfigurationController';
import { CreateProfileController } from 'InvestmentAccounts/Infrastructure/Ports/Controller/CreateProfileController';

export default class PortsProviders {
  private config: InvestmentAccounts.Config;

  constructor(config: InvestmentAccounts.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addSingleton(CreateProfileController, [CreateProfile])
      .addSingleton(AccountManagementController, [OpenAccount])
      .addSingleton(ConfigurationController, [CreateConfiguration, GetConfiguration]);
  }
}
