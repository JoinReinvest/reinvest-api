import dayjs from 'dayjs';
import { Money } from 'Money/Money';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { DividendDetails, DividendState } from 'SharesAndDividends/Domain/types';

export class DividendsListQuery {
  private dividendsRepository: DividendsRepository;

  constructor(dividendsRepository: DividendsRepository) {
    this.dividendsRepository = dividendsRepository;
  }

  static getClassName = () => 'DividendsListQuery';

  async getList(profileId: string, accountId: string): Promise<DividendDetails[] | null> {
    const dividends = await this.dividendsRepository.getDividends(profileId, accountId);

    if (!dividends || !dividends?.length) {
      return null;
    }

    const list = dividends?.map(dividend => {
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
    });

    return list;
  }
}
