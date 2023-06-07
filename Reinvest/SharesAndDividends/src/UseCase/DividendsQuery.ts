import dayjs from 'dayjs';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { DividendDeclaration } from 'SharesAndDividends/Domain/Dividends/DividendDeclaration';

export enum DividendState {
  PENDING = 'PENDING',
  PAID_OUT = 'PAID_OUT',
  REINVESTED = 'REINVESTED',
  PAYING_OUT = 'PAYING_OUT',
}

export type DividendDetails = {
  amount: {
    formatted: string;
    value: number;
  };
  date: string;
  id: string;
  status: DividendState;
};

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

export class DividendsQuery {
  private dividendsRepository: DividendsRepository;

  constructor(dividendsRepository: DividendsRepository) {
    this.dividendsRepository = dividendsRepository;
  }

  static getClassName = () => 'DividendsQuery';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    const dividend = await this.dividendsRepository.findDividend(profileId, dividendId);

    if (!dividend) {
      return null;
    }

    const { amount, createdDate, id, status } = dividend;
    const money = new Money(amount);

    let dividendStatus = DividendState.PENDING;

    if (['WITHDRAWN', 'ZEROED'].includes(status)) {
      dividendStatus = DividendState.PAID_OUT;
    } else if (status === 'WITHDRAWING') {
      dividendStatus = DividendState.PAYING_OUT;
    } else if (status === 'REINVESTED') {
      dividendStatus = DividendState.REINVESTED;
    }

    return {
      amount: {
        formatted: money.getFormattedAmount(),
        value: money.getAmount(),
      },
      date: dayjs(createdDate).format('YYYY-MM-DD'),
      id,
      status: dividendStatus,
    };
  }

  async getDividendDeclarations(): Promise<DividendDeclarationResponse[]> {
    const declarations = await this.dividendsRepository.getDividendDeclarations();

    return declarations.map((declaration: DividendDeclaration): DividendDeclarationResponse => this.mapDividendDeclarationToResponse(declaration));
  }

  async getDividendDeclarationByDate(declarationDate: Date): Promise<DividendDeclarationResponse | null> {
    const declaration = await this.dividendsRepository.getDividendDeclarationByDate(DateTime.from(declarationDate));

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
