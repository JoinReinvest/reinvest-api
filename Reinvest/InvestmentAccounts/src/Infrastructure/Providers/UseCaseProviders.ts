import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import CreateConfiguration from 'InvestmentAccounts/Application/CreateConfiguration';
import CreateProfile from 'InvestmentAccounts/Application/CreateProfile';
import GetConfiguration from 'InvestmentAccounts/Application/GetConfiguration';
import { OpenAccount } from 'InvestmentAccounts/Application/OpenAccount';
import { RemoveBeneficiary } from 'InvestmentAccounts/Application/RemoveBeneficiary';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { ConfigurationRepository } from 'InvestmentAccounts/Infrastructure/Storage/Repository/ConfigurationRepository';
import { ProfileRepository } from 'InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository';

export default class UseCaseProviders {
  private config: InvestmentAccounts.Config;

  constructor(config: InvestmentAccounts.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container
      .addSingleton(OpenAccount, [ProfileRepository])
      .addSingleton(RemoveBeneficiary, [ProfileRepository])
      .addSingleton(CreateProfile, [ProfileRepository])
      .addSingleton(CreateConfiguration, [ConfigurationRepository, IdGenerator])
      .addSingleton(GetConfiguration, [ConfigurationRepository]);
  }
}
