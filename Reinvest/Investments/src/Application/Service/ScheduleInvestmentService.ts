import dayjs from 'dayjs';
import { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';

const SIMULATION_DATES_QUANTITY = 8;

class ScheduleInvestmentService {
  private startDate: string;
  private frequency: RecurringInvestmentFrequency;

  constructor(startDate: string, frequency: RecurringInvestmentFrequency) {
    this.startDate = startDate;
    this.frequency = frequency;
  }

  getSimulation() {
    const dates = [];
    const { multiplyer, type } = this.getTypeAndValueToMultiplyer();

    for (let i = 1; i <= SIMULATION_DATES_QUANTITY; i++) {
      const date = dayjs(this.startDate)
        .add(i * multiplyer, type)
        .format('YYYY-MM-DD');
      dates.push(date);
    }

    return dates;
  }

  private getTypeAndValueToMultiplyer(): { multiplyer: number; type: 'week' | 'month' } {
    switch (this.frequency) {
      case RecurringInvestmentFrequency.WEEKLY:
        return {
          multiplyer: 1,
          type: 'week',
        };
      case RecurringInvestmentFrequency.BI_WEEKLY:
        return {
          multiplyer: 2,
          type: 'week',
        };
      case RecurringInvestmentFrequency.MONTHLY:
        return {
          multiplyer: 1,
          type: 'month',
        };
      case RecurringInvestmentFrequency.QUARTERLY:
        return {
          multiplyer: 3,
          type: 'month',
        };
    }
  }
}

export default ScheduleInvestmentService;
