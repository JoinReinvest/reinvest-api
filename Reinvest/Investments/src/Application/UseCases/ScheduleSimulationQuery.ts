import { IsoDateString } from 'HKEKTypes/Generics';
import type { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';
import ScheduleInvestmentService from 'Investments/Domain/Service/ScheduleInvestmentService';
import { DateTime } from 'Money/DateTime';

class ScheduleSimulationQuery {
  static getClassName = (): string => 'ScheduleSimulationQuery';

  async execute(startDate: DateTime, frequency: RecurringInvestmentFrequency): Promise<IsoDateString[]> {
    const scheduleSimulation = new ScheduleInvestmentService(startDate, frequency);

    return scheduleSimulation.getSimulation();
  }
}

export default ScheduleSimulationQuery;
