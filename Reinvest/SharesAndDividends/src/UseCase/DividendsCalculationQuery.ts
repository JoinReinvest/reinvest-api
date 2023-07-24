import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { DividendDeclaration, DividendDeclarationStatus } from 'SharesAndDividends/Domain/CalculatingDividends/DividendDeclaration';

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
  id: UUID;
  numberOfDays: number;
  numberOfSharesPerDay: NumberOfSharesPerDayResponse[];
  status: DividendDeclarationStatus;
  unitAmountPerDay: string;
};

export type SharesToCalculate = {
  declarationId: UUID;
  sharesIds: UUID[];
};

export type DividendDistributionResponse = {
  distributeToDate: string;
  id: UUID;
  status: 'DISTRIBUTING' | 'DISTRIBUTED';
};

export type DividendDeclarationStatsResponse = {
  AWAITING_DISTRIBUTION: {
    inDividends: string;
    inFees: string;
  };
  DISTRIBUTED: {
    inDividends: string;
    inFees: string;
  };
  LOCKED: {
    inDividends: string;
    inFees: string;
  };
  REVOKED: {
    inDividends: string;
    inFees: string;
  };
  TOTAL: {
    inDividends: string;
    inFees: string;
  };
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

  async getNextSharesToCalculate(): Promise<null | SharesToCalculate> {
    const pendingDeclaration = await this.dividendsCalculationRepository.getPendingDeclaration();

    if (!pendingDeclaration) {
      return null;
    }

    const { portfolioId, declarationId, toDate } = pendingDeclaration.forFindingSharesToCalculate();
    const sharesIds = await this.dividendsCalculationRepository.getSharesIdsToCalculate(portfolioId, declarationId, toDate);

    return {
      declarationId,
      sharesIds,
    };
  }

  async getDividendDeclarationStats(declarationId: UUID): Promise<DividendDeclarationStatsResponse | null> {
    const declarationStats = await this.dividendsCalculationRepository.getDividendDeclarationStats(declarationId);

    if (!declarationStats) {
      return null;
    }

    const response = {
      AWAITING_DISTRIBUTION: {
        inDividends: Money.zero().getFormattedAmount(),
        inFees: Money.zero().getFormattedAmount(),
      },
      DISTRIBUTED: {
        inDividends: Money.zero().getFormattedAmount(),
        inFees: Money.zero().getFormattedAmount(),
      },
      LOCKED: {
        inDividends: Money.zero().getFormattedAmount(),
        inFees: Money.zero().getFormattedAmount(),
      },
      REVOKED: {
        inDividends: Money.zero().getFormattedAmount(),
        inFees: Money.zero().getFormattedAmount(),
      },
      TOTAL: {
        inDividends: Money.zero().getFormattedAmount(),
        inFees: Money.zero().getFormattedAmount(),
      },
    };

    let totalDividend = Money.zero();
    let totalFee = Money.zero();

    for (const record of declarationStats) {
      const { status, inDividends, inFees } = record;
      const dividend = Money.lowPrecision(parseInt(<string>inDividends));
      const fee = Money.lowPrecision(parseInt(<string>inFees));

      response[status] = {
        inDividends: dividend.getFormattedAmount(),
        inFees: fee.getFormattedAmount(),
      };

      totalDividend = totalDividend.add(dividend);
      totalFee = totalFee.add(fee);
    }

    response.TOTAL = {
      inDividends: totalDividend.getFormattedAmount(),
      inFees: totalFee.getFormattedAmount(),
    };

    return response;
  }

  async getDividendDistributionById(id: UUID): Promise<DividendDistributionResponse | null> {
    const dividendDistribution = await this.dividendsCalculationRepository.getDividendDistributionById(id);

    if (!dividendDistribution) {
      return null;
    }

    const { distributeToDate, status } = dividendDistribution.toObject();

    return {
      id,
      distributeToDate: DateTime.from(distributeToDate).toIsoDate(),
      status,
    };
  }

  async getAccountsForDividendDistribution(): Promise<null | {
    accountIds: UUID[];
    distributionId: UUID;
  }> {
    const dividendDistribution = await this.dividendsCalculationRepository.getLastPendingDividendDistribution();

    if (!dividendDistribution) {
      return null;
    }

    const { distributionId, distributeToDate } = dividendDistribution.forFindingAccountsToDistributeDividend();
    const accountIds = await this.dividendsCalculationRepository.getAccountsForDividendDistribution(distributeToDate);

    return {
      accountIds,
      distributionId,
    };
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
