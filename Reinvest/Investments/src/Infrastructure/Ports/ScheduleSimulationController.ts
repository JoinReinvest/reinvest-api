import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import type { ScheduleSimulationFrequency } from 'Investments/Domain/Investments/Types';

export class ScheduleSimulationController {
  private scheduleSimulationQueryUseCase: ScheduleSimulationQuery;

  constructor(scheduleSimulationQueryUseCase: ScheduleSimulationQuery) {
    this.scheduleSimulationQueryUseCase = scheduleSimulationQueryUseCase;
  }

  public static getClassName = (): string => 'ScheduleSimulationController';

  public async getScheduleSimulation(startDate: string, frequency: ScheduleSimulationFrequency) {
    return await this.scheduleSimulationQueryUseCase.execute(startDate, frequency);
  }
}
