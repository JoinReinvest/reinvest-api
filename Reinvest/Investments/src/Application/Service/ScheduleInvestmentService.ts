import dayjs from 'dayjs';
import { ScheduleSimulationFrequency } from 'Investments/Domain/Investments/Types';

const SIMULATION_DATES_QUANTITY = 8;

class ScheduleInvestmentService {
  private startDate: string;
  private frequency: ScheduleSimulationFrequency;

  constructor(startDate: string, frequency: ScheduleSimulationFrequency) {
    this.startDate = startDate;
    this.frequency = frequency;
  }

  getSimulation() {
    const dates = [];
    const { multiplyer, type } = this.getTypeAndValueToAdd();

    for (let i = 1; i <= SIMULATION_DATES_QUANTITY; i++) {
      const date = dayjs(this.startDate)
        .add(i * multiplyer, type)
        .format('YYYY-MM-DD');
      dates.push(date);
    }

    return dates;
  }

  private getTypeAndValueToAdd(): { multiplyer: number; type: 'week' | 'month' } {
    switch (this.frequency) {
      case ScheduleSimulationFrequency.WEEKLY:
        return {
          multiplyer: 1,
          type: 'week',
        };
      case ScheduleSimulationFrequency.BI_WEEKLY:
        return {
          multiplyer: 2,
          type: 'week',
        };
      case ScheduleSimulationFrequency.MONTHLY:
        return {
          multiplyer: 1,
          type: 'month',
        };
      case ScheduleSimulationFrequency.QUARTERLY:
        return {
          multiplyer: 3,
          type: 'month',
        };
    }
  }
}

export default ScheduleInvestmentService;
