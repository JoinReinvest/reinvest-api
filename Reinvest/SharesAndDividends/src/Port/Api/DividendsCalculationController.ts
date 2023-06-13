import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { CalculateDividends } from 'SharesAndDividends/UseCase/CalculateDividends';
import { CreateDividendDistribution } from 'SharesAndDividends/UseCase/CreateDividendDistribution';
import { DeclareDividend } from 'SharesAndDividends/UseCase/DeclareDividend';
import { DistributeDividends } from 'SharesAndDividends/UseCase/DistributeDividends';
import {
  DividendDeclarationResponse,
  DividendDeclarationStatsResponse,
  DividendDistributionResponse,
  DividendsCalculationQuery,
  SharesToCalculate,
} from 'SharesAndDividends/UseCase/DividendsCalculationQuery';
import { FinishDividendsCalculation } from 'SharesAndDividends/UseCase/FinishDividendsCalculation';
import { FinishDividendsDistribution } from 'SharesAndDividends/UseCase/FinishDividendsDistribution';

type DeclarationError = string;

export class DividendsCalculationController {
  private dividendsCalculationQuery: DividendsCalculationQuery;
  private declareDividendUseCase: DeclareDividend;
  private calculateDividendsUseCase: CalculateDividends;
  private createDividendDistributionUseCase: CreateDividendDistribution;
  private distributeDividendsUseCase: DistributeDividends;
  private finishDividendsCalculationUseCase: FinishDividendsCalculation;
  private finishDividendsDistributionUseCase: FinishDividendsDistribution;

  constructor(
    dividendsCalculationQuery: DividendsCalculationQuery,
    declareDividendUseCase: DeclareDividend,
    calculateDividendsUseCase: CalculateDividends,
    createDividendDistributionUseCase: CreateDividendDistribution,
    distributeDividendsUseCase: DistributeDividends,
    finishDividendsCalculationUseCase: FinishDividendsCalculation,
    finishDividendsDistributionUseCase: FinishDividendsDistribution,
  ) {
    this.dividendsCalculationQuery = dividendsCalculationQuery;
    this.declareDividendUseCase = declareDividendUseCase;
    this.calculateDividendsUseCase = calculateDividendsUseCase;
    this.createDividendDistributionUseCase = createDividendDistributionUseCase;
    this.distributeDividendsUseCase = distributeDividendsUseCase;
    this.finishDividendsCalculationUseCase = finishDividendsCalculationUseCase;
    this.finishDividendsDistributionUseCase = finishDividendsDistributionUseCase;
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

  async calculationsCompleted(declarationId: UUID): Promise<void> {
    await this.finishDividendsCalculationUseCase.execute(declarationId);
  }

  async distributionsCompleted(distributionId: UUID): Promise<void> {
    await this.finishDividendsDistributionUseCase.execute(distributionId);
  }

  async calculateDividendsForShares(sharesToCalculate: SharesToCalculate): Promise<void> {
    await this.calculateDividendsUseCase.execute(sharesToCalculate);
  }

  async createDividendDistribution(): Promise<null | UUID> {
    return this.createDividendDistributionUseCase.execute();
  }

  async getAccountsForDividendDistribution(): Promise<null | {
    accountIds: UUID[];
    distributionId: UUID;
  }> {
    return this.dividendsCalculationQuery.getAccountsForDividendDistribution();
  }

  async distributeDividends(distributionId: UUID, accountIds: UUID[]): Promise<void> {
    await this.distributeDividendsUseCase.execute(distributionId, accountIds);
  }

  async getDividendDistributionById(id: UUID): Promise<null | DividendDistributionResponse> {
    return this.dividendsCalculationQuery.getDividendDistributionById(id);
  }
}
