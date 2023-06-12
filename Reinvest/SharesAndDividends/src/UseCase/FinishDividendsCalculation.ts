import { UUID } from 'HKEKTypes/Generics';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';

export class FinishDividendsCalculation {
  private dividendsCalculationRepository: DividendsCalculationRepository;

  constructor(dividendsCalculationRepository: DividendsCalculationRepository) {
    this.dividendsCalculationRepository = dividendsCalculationRepository;
  }

  static getClassName = () => 'FinishDividendsCalculation';

  async execute(declarationId: UUID): Promise<void> {
    const declaration = await this.dividendsCalculationRepository.getDividendDeclarationById(declarationId);

    if (!declaration) {
      return;
    }

    declaration.finishCalculation();

    await this.dividendsCalculationRepository.storeDividendDeclaration(declaration);
  }
}
