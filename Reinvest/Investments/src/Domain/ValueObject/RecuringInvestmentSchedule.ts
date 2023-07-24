import dayjs from 'dayjs';
import type { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';

export class RecurringInvestmentSchedule {
  private startDate: string;
  private frequency: RecurringInvestmentFrequency;

  constructor(startDate: string, frequency: RecurringInvestmentFrequency) {
    this.startDate = startDate;
    this.frequency = frequency;
  }

  static create(data: { frequency: RecurringInvestmentFrequency; startDate: Date }) {
    const { startDate, frequency } = data;

    const ISOStartDate = dayjs(startDate).format('YYYY-MM-DD');

    return new RecurringInvestmentSchedule(ISOStartDate, frequency);
  }

  toObject() {
    return {
      startDate: this.startDate,
      frequency: this.frequency,
    };
  }
}
