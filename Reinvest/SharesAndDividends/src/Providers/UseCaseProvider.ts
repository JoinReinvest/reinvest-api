import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';

export class UseCaseProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateShares, [SharesRepository, IdGenerator]);
  }
}
