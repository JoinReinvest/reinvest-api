import type { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';

export class RecurringInvestmentSchedule {
  startDate: string;
  frequency: RecurringInvestmentFrequency;

  constructor(startDate: string, frequency: RecurringInvestmentFrequency) {
    this.startDate = startDate;
    this.frequency = frequency;
  }

  static create(data: { frequency: RecurringInvestmentFrequency; startDate: string }) {
    const { startDate, frequency } = data;

    return new RecurringInvestmentSchedule(startDate, frequency);
  }
}
