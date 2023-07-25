import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { Money } from 'Money/Money';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { Shares, SharesOrigin } from 'SharesAndDividends/Domain/Shares';

export class CreateShares {
  private sharesRepository: SharesRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(sharesRepository: SharesRepository, idGenerator: IdGeneratorInterface) {
    this.sharesRepository = sharesRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'CreateShares';

  async execute(portfolioId: string, profileId: string, accountId: string, originId: string, price: Money, origin: SharesOrigin): Promise<void> {
    const existingShares = await this.sharesRepository.getSharesByOriginId(originId);

    if (existingShares) {
      console.log(`Shares with originId ${originId} already exists`);

      return;
    }

    const id = this.idGenerator.createUuid();
    const shares = Shares.create(id, portfolioId, profileId, accountId, originId, price, origin);

    await this.sharesRepository.store(shares);
  }
}
