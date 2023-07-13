import { IsoDateString } from 'HKEKTypes/Generics';
import { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';
import { DateTime } from 'Money/DateTime';

const DATES_TO_CREATE = 7;

class ScheduleInvestmentService {
  private startDate: DateTime;
  private frequency: RecurringInvestmentFrequency;

  constructor(startDate: DateTime, frequency: RecurringInvestmentFrequency) {
    this.startDate = startDate;
    this.frequency = frequency;
  }

  getSimulation(): IsoDateString[] {
    const dates = [this.startDate.toIsoDate()];
    const { multiplier, type } = this.getTypeAndValueToMultiplier();

    for (let i = 1; i <= DATES_TO_CREATE; i++) {
      const date = this.startDate.add(i * multiplier, type).toIsoDate();
      dates.push(date);
    }

    return dates;
  }

  getNextInvestmentDate(lastExecutionDate: DateTime | null): DateTime {
    const { multiplier, type } = this.getTypeAndValueToMultiplier();

    if (!lastExecutionDate) {
      return this.startDate;
    }

    let nextDate = this.startDate;
    do {
      nextDate = nextDate.add(multiplier, type);
    } while (nextDate.isBefore(lastExecutionDate));

    return nextDate;
  }

  private getTypeAndValueToMultiplier(): { multiplier: number; type: 'week' | 'month' } {
    switch (this.frequency) {
      case RecurringInvestmentFrequency.WEEKLY:
        return {
          multiplier: 1,
          type: 'week',
        };
      case RecurringInvestmentFrequency.BI_WEEKLY:
        return {
          multiplier: 2,
          type: 'week',
        };
      case RecurringInvestmentFrequency.MONTHLY:
        return {
          multiplier: 1,
          type: 'month',
        };
      case RecurringInvestmentFrequency.QUARTERLY:
        return {
          multiplier: 3,
          type: 'month',
        };
    }
  }
}

export default ScheduleInvestmentService;
