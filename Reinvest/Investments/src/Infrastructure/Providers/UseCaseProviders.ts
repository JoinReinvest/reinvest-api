import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';

import { Investments } from '../..';
import { InvestmentsRepository } from '../Adapters/Repository/InvestmentsRepository';
import CreateInvestment from '../UseCases/CreateInvestment';

export default class UseCaseProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addSingleton(CreateInvestment, [InvestmentsRepository, IdGenerator]);
  }
}
