import dayjs from 'dayjs';
import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { DividendDetails, DividendState } from 'SharesAndDividends/Domain/types';

export type AutoReinvestDividend = {
  accountId: UUID;
  dividendId: UUID;
  profileId: UUID;
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

    if (['WITHDRAWN', 'ZEROED', 'FEES_NOT_COVERED', 'FEES_MOVED_TO_NEXT_DIVIDEND'].includes(status)) {
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

  async getDividendsReadyForAutomaticReinvestment(): Promise<AutoReinvestDividend[]> {
    return this.dividendsRepository.findDividendsReadyForAutomaticReinvestment();
  }
}
