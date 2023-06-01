import dayjs from 'dayjs';
import { Money } from 'Money/Money';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';

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
}
