import { IsoDateString } from 'HKEKTypes/Generics';
import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import type { RecurringInvestmentFrequency } from 'Investments/Domain/Investments/Types';
import { DateTime } from 'Money/DateTime';

export class ScheduleSimulationController {
  private scheduleSimulationQuery: ScheduleSimulationQuery;

  constructor(scheduleSimulationQuery: ScheduleSimulationQuery) {
    this.scheduleSimulationQuery = scheduleSimulationQuery;
  }

  public static getClassName = (): string => 'ScheduleSimulationController';

  public async getScheduleSimulation(startDate: string, frequency: RecurringInvestmentFrequency): Promise<IsoDateString[]> {
    return this.scheduleSimulationQuery.execute(DateTime.fromIsoDate(startDate), frequency);
  }
}
