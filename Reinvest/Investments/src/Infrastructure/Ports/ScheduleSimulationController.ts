import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import type { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';

export class ScheduleSimulationController {
  private scheduleSimulationQueryUseCase: ScheduleSimulationQuery;

  constructor(scheduleSimulationQueryUseCase: ScheduleSimulationQuery) {
    this.scheduleSimulationQueryUseCase = scheduleSimulationQueryUseCase;
  }

  public static getClassName = (): string => 'ScheduleSimulationController';

  public async getScheduleSimulation(startDate: string, frequency: RecurringInvestmentFrequency) {
    return await this.scheduleSimulationQueryUseCase.execute(startDate, frequency);
  }
}
