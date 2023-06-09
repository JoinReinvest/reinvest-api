import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';

export class DistributeDividends {
  private dividendsCalculationRepository: DividendsCalculationRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(idGenerator: IdGeneratorInterface, dividendsCalculationRepository: DividendsCalculationRepository) {
    this.idGenerator = idGenerator;
    this.dividendsCalculationRepository = dividendsCalculationRepository;
  }

  static getClassName = () => 'DistributeDividends';

  async execute(distributionId: UUID, accountIds: UUID[]): Promise<void> {
    console.log('[DistributeDividends] execute', { distributionId, accountIds });

    return;
  }
}
