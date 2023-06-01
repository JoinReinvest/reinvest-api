import dayjs from 'dayjs';
import { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';

const DATES_TO_CREATE = 7;

class ScheduleInvestmentService {
  private startDate: string;
  private frequency: RecurringInvestmentFrequency;

  constructor(startDate: string | Date, frequency: RecurringInvestmentFrequency) {
    this.startDate = dayjs(startDate).format('YYYY-MM-DD');
    this.frequency = frequency;
  }

  getSimulation() {
    const dates = [this.startDate];
    const { multiplier, type } = this.getTypeAndValueToMultiplier();

    for (let i = 1; i <= DATES_TO_CREATE; i++) {
      const date = dayjs(this.startDate)
        .add(i * multiplier, type)
        .format('YYYY-MM-DD');
      dates.push(date);
    }

    return dates;
  }

  getNextInvestmentDate() {
    const { multiplier, type } = this.getTypeAndValueToMultiplier();
    const startDate = dayjs(this.startDate);

    const now = dayjs(dayjs().format('YYYY-MM-DD'));
    let nextDate = startDate;

    while (nextDate.isBefore(now)) {
      nextDate = nextDate.add(multiplier, type);
    }

    return nextDate.format('YYYY-MM-DD');
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
