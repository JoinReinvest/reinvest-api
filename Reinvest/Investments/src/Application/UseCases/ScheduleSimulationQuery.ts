import ScheduleInvestmentService from 'Investments/Application/Service/ScheduleInvestmentService';
import type { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';

class ScheduleSimulationQuery {
  static getClassName = (): string => 'ScheduleSimulationQuery';

  async execute(startDate: string, frequency: RecurringInvestmentFrequency) {
    const scheduleSimulation = new ScheduleInvestmentService(startDate, frequency);

    const simulation = scheduleSimulation.getSimulation();

    return simulation;
  }
}

export default ScheduleSimulationQuery;
