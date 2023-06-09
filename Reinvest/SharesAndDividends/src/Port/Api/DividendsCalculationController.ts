import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { CalculateDividends } from 'SharesAndDividends/UseCase/CalculateDividends';
import { DeclareDividend } from 'SharesAndDividends/UseCase/DeclareDividend';
import {
  DividendDeclarationResponse,
  DividendDeclarationStatsResponse,
  DividendsCalculationQuery,
  SharesToCalculate,
} from 'SharesAndDividends/UseCase/DividendsCalculationQuery';

type DeclarationError = string;

export class DividendsCalculationController {
  private dividendsCalculationQuery: DividendsCalculationQuery;
  private declareDividendUseCase: DeclareDividend;
  private calculateDividendsUseCase: CalculateDividends;

  constructor(dividendsCalculationQuery: DividendsCalculationQuery, declareDividendUseCase: DeclareDividend, calculateDividendsUseCase: CalculateDividends) {
    this.dividendsCalculationQuery = dividendsCalculationQuery;
    this.declareDividendUseCase = declareDividendUseCase;
    this.calculateDividendsUseCase = calculateDividendsUseCase;
  }

  static getClassName = () => 'DividendsCalculationController';

  async getDividendDeclarations(): Promise<DividendDeclarationResponse[]> {
    return this.dividendsCalculationQuery.getDividendDeclarations();
  }

  async getDividendDeclarationByDate(declarationDate: Date): Promise<DividendDeclarationResponse | null> {
    return this.dividendsCalculationQuery.getDividendDeclarationByDate(declarationDate);
  }

  async getDividendDeclarationStats(declarationId: UUID): Promise<DividendDeclarationStatsResponse | null> {
    return this.dividendsCalculationQuery.getDividendDeclarationStats(declarationId);
  }

  async declareDividend(portfolioId: string, amount: number, declarationDate: Date): Promise<DeclarationError | null> {
    try {
      await this.declareDividendUseCase.execute(portfolioId, new Money(amount), DateTime.fromIsoDate(declarationDate));

      return null;
    } catch (error: any) {
      console.error('Dividend declaration', error);

      return error.message;
    }
  }

  async getNextSharesToCalculate(): Promise<null | SharesToCalculate> {
    return this.dividendsCalculationQuery.getNextSharesToCalculate();
  }

  async calculateDividendsForShares(sharesToCalculate: SharesToCalculate): Promise<void> {
    await this.calculateDividendsUseCase.execute(sharesToCalculate);
  }
}
