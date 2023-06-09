import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { DeclareDividend } from 'SharesAndDividends/UseCase/DeclareDividend';
import { DividendDeclarationResponse, DividendsCalculationQuery } from 'SharesAndDividends/UseCase/DividendsCalculationQuery';

type DeclarationError = string;

export class DividendsCalculationController {
  private dividendsCalculationQuery: DividendsCalculationQuery;
  private declareDividendUseCase: DeclareDividend;

  constructor(dividendsCalculationQuery: DividendsCalculationQuery, declareDividendUseCase: DeclareDividend) {
    this.dividendsCalculationQuery = dividendsCalculationQuery;
    this.declareDividendUseCase = declareDividendUseCase;
  }

  static getClassName = () => 'DividendsCalculationController';

  async getDividendDeclarations(): Promise<DividendDeclarationResponse[]> {
    return this.dividendsCalculationQuery.getDividendDeclarations();
  }

  async getDividendDeclarationByDate(declarationDate: Date): Promise<DividendDeclarationResponse | null> {
    return this.dividendsCalculationQuery.getDividendDeclarationByDate(declarationDate);
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

  async getNextSharesToCalculate(profileId: string): Promise<any> {
    return [];
  }
}
