import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { DividendDistribution } from 'SharesAndDividends/Domain/Dividends/DividendDistribution';

export class CreateDividendDistribution {
  private dividendsCalculationRepository: DividendsCalculationRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(idGenerator: IdGeneratorInterface, dividendsCalculationRepository: DividendsCalculationRepository) {
    this.idGenerator = idGenerator;
    this.dividendsCalculationRepository = dividendsCalculationRepository;
  }

  static getClassName = () => 'CreateDividendDistribution';

  async execute(): Promise<UUID> {
    const existingDividendDistribution = await this.dividendsCalculationRepository.getLastPendingDividendDistribution();

    if (existingDividendDistribution) {
      return existingDividendDistribution.getId();
    }

    const id = this.idGenerator.createUuid();
    const dividendDistribution = DividendDistribution.create(id, DateTime.now());

    await this.dividendsCalculationRepository.createDividendDistribution(dividendDistribution);

    return id;
  }
}
