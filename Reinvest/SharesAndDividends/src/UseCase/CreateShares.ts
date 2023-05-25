import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { Shares } from 'SharesAndDividends/Domain/Shares';

export class CreateShares {
  private sharesRepository: SharesRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(sharesRepository: SharesRepository, idGenerator: IdGeneratorInterface) {
    this.sharesRepository = sharesRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'CreateShares';

  async execute(portfolioId: string, profileId: string, accountId: string, investmentId: string, price: number): Promise<void> {
    const id = this.idGenerator.createUuid();
    const shares = Shares.create(id, portfolioId, profileId, accountId, investmentId, price);

    await this.sharesRepository.store(shares);
  }
}
