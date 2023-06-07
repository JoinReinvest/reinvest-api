import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { DeclareDividend } from 'SharesAndDividends/UseCase/DeclareDividend';
import { DividendDeclarationResponse, DividendDetails, DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';

type DeclarationError = string;

export class DividendsController {
  private dividendsQuery: DividendsQuery;
  private dividendsRepository: DividendsRepository;
  private declareDividendUseCase: DeclareDividend;

  constructor(dividendsQuery: DividendsQuery, dividendsRepository: DividendsRepository, declareDividendUseCase: DeclareDividend) {
    this.dividendsQuery = dividendsQuery;
    this.dividendsRepository = dividendsRepository;
    this.declareDividendUseCase = declareDividendUseCase;
  }

  static getClassName = () => 'DividendsController';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.dividendsQuery.getDividend(profileId, dividendId);
  }

  async markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void> {
    // TODO include regular investor dividend - do it on the domain side, not on db side!!
    await this.dividendsRepository.markIncentiveDividendReinvested(profileId, accountId, dividendId);
  }

  async getDividendDeclarations(): Promise<DividendDeclarationResponse[]> {
    return this.dividendsQuery.getDividendDeclarations();
  }

  async getDividendDeclarationByDate(declarationDate: Date): Promise<DividendDeclarationResponse | null> {
    return this.dividendsQuery.getDividendDeclarationByDate(declarationDate);
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
}
