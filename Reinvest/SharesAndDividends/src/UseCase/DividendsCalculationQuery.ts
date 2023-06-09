import { DateTime } from 'Money/DateTime';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { DividendDeclaration } from 'SharesAndDividends/Domain/Dividends/DividendDeclaration';

export type NumberOfSharesPerDayResponse = {
  date: string;
  numberOfShares: number;
};

export type DividendDeclarationResponse = {
  amount: string;
  calculatingFromDate: string;
  calculationFinishedDate: string | null;
  createdDate: string;
  declarationDate: string;
  id: string;
  numberOfDays: number;
  numberOfSharesPerDay: NumberOfSharesPerDayResponse[];
  status: 'CALCULATING' | 'CALCULATED';
  unitAmountPerDay: string;
};

export class DividendsCalculationQuery {
  private dividendsCalculationRepository: DividendsCalculationRepository;

  constructor(dividendsCalculationRepository: DividendsCalculationRepository) {
    this.dividendsCalculationRepository = dividendsCalculationRepository;
  }

  static getClassName = () => 'DividendsCalculationQuery';

  async getDividendDeclarations(): Promise<DividendDeclarationResponse[]> {
    const declarations = await this.dividendsCalculationRepository.getDividendDeclarations();

    return declarations.map((declaration: DividendDeclaration): DividendDeclarationResponse => this.mapDividendDeclarationToResponse(declaration));
  }

  async getDividendDeclarationByDate(declarationDate: Date): Promise<DividendDeclarationResponse | null> {
    const declaration = await this.dividendsCalculationRepository.getDividendDeclarationByDate(DateTime.from(declarationDate));

    return declaration ? this.mapDividendDeclarationToResponse(declaration) : null;
  }

  private mapDividendDeclarationToResponse(declaration: DividendDeclaration): DividendDeclarationResponse {
    const {
      calculatedFromDate,
      calculatedToDate,
      calculationFinishedDate,
      createdDate,
      id,
      numberOfDays,
      numberOfShares: { days },
      status,
    } = declaration.toObject();

    return {
      amount: declaration.getFormattedAmount(),
      calculatingFromDate: DateTime.from(calculatedFromDate).toIsoDate(),
      calculationFinishedDate: calculationFinishedDate ? DateTime.from(calculationFinishedDate).toIsoDate() : null,
      createdDate: DateTime.from(createdDate).toIsoDateTime(),
      declarationDate: DateTime.from(calculatedToDate).toIsoDate(),
      id,
      numberOfDays,
      // @ts-ignore
      numberOfSharesPerDay: Object.keys(days).map(day => ({
        // @ts-ignore
        date: DateTime.from(day).toIsoDate(),
        // @ts-ignore
        numberOfShares: days[day],
      })),
      status,
      unitAmountPerDay: declaration.getFormattedUnitAmountPerDay(),
    };
  }
}
