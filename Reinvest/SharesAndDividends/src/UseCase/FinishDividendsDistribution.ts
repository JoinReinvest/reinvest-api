import { UUID } from 'HKEKTypes/Generics';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';

export class FinishDividendsDistribution {
  private dividendsCalculationRepository: DividendsCalculationRepository;

  constructor(dividendsCalculationRepository: DividendsCalculationRepository) {
    this.dividendsCalculationRepository = dividendsCalculationRepository;
  }

  static getClassName = () => 'FinishDividendsDistribution';

  async execute(distributionId: UUID): Promise<void> {
    const distribution = await this.dividendsCalculationRepository.getDividendDistributionById(distributionId);

    if (!distribution) {
      return;
    }

    distribution.finishDistribution();

    await this.dividendsCalculationRepository.storeDividendDistribution(distribution);
  }
}
