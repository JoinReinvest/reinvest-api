import { expect } from 'chai';
import ScheduleInvestmentService from 'Reinvest/Investments/src/Application/Service/ScheduleInvestmentService';
import { RecurringInvestmentFrequency } from 'Reinvest/Investments/src/Domain/Investments/Types';

context('Schedule investment service', () => {
  describe('When ScheduleInvestmentService got proper schedule object', () => {
    it('Should return array with correct dates with WEEKLY frequency', () => {
      const schedule = {
        startDate: '2023-06-01',
        frequency: RecurringInvestmentFrequency.WEEKLY,
      };
      const simulation = new ScheduleInvestmentService(schedule.startDate, schedule.frequency);

      const dates = simulation.getSimulation();

      expect(dates[0]).is.equal('2023-06-08');
      expect(dates[1]).is.equal('2023-06-15');
      expect(dates[2]).is.equal('2023-06-22');
      expect(dates[3]).is.equal('2023-06-29');
      expect(dates[4]).is.equal('2023-07-06');
      expect(dates[5]).is.equal('2023-07-13');
      expect(dates[6]).is.equal('2023-07-20');
      expect(dates[7]).is.equal('2023-07-27');
    });

    it('Should return array with correct dates with BI_WEEKLY frequency', () => {
      const schedule = {
        startDate: '2023-06-16',
        frequency: RecurringInvestmentFrequency.BI_WEEKLY,
      };
      const simulation = new ScheduleInvestmentService(schedule.startDate, schedule.frequency);

      const dates = simulation.getSimulation();

      expect(dates[0]).is.equal('2023-06-30');
      expect(dates[1]).is.equal('2023-07-14');
      expect(dates[2]).is.equal('2023-07-28');
      expect(dates[3]).is.equal('2023-08-11');
      expect(dates[4]).is.equal('2023-08-25');
      expect(dates[5]).is.equal('2023-09-08');
      expect(dates[6]).is.equal('2023-09-22');
      expect(dates[7]).is.equal('2023-10-06');
    });

    it('Should return array with correct dates with MONTHLY frequency and started from last day of a month', () => {
      const schedule = {
        startDate: '2023-01-31',
        frequency: RecurringInvestmentFrequency.MONTHLY,
      };
      const simulation = new ScheduleInvestmentService(schedule.startDate, schedule.frequency);

      const dates = simulation.getSimulation();

      expect(dates[0]).is.equal('2023-02-28');
      expect(dates[1]).is.equal('2023-03-31');
      expect(dates[2]).is.equal('2023-04-30');
      expect(dates[3]).is.equal('2023-05-31');
      expect(dates[4]).is.equal('2023-06-30');
      expect(dates[5]).is.equal('2023-07-31');
      expect(dates[6]).is.equal('2023-08-31');
      expect(dates[7]).is.equal('2023-09-30');
    });

    it('Should return array with correct dates with QUARTERLY frequency', () => {
      const schedule = {
        startDate: '2023-04-25',
        frequency: RecurringInvestmentFrequency.QUARTERLY,
      };
      const simulation = new ScheduleInvestmentService(schedule.startDate, schedule.frequency);

      const dates = simulation.getSimulation();

      expect(dates[0]).is.equal('2023-07-25');
      expect(dates[1]).is.equal('2023-10-25');
      expect(dates[2]).is.equal('2024-01-25');
      expect(dates[3]).is.equal('2024-04-25');
      expect(dates[4]).is.equal('2024-07-25');
      expect(dates[5]).is.equal('2024-10-25');
      expect(dates[6]).is.equal('2025-01-25');
      expect(dates[7]).is.equal('2025-04-25');
    });

    it('Should return array with correct dates with QUARTERLY frequency and startedDate set to end on the month', () => {
      const schedule = {
        startDate: '2023-08-31',
        frequency: RecurringInvestmentFrequency.QUARTERLY,
      };
      const simulation = new ScheduleInvestmentService(schedule.startDate, schedule.frequency);

      const dates = simulation.getSimulation();

      expect(dates[0]).is.equal('2023-11-30');
      expect(dates[1]).is.equal('2024-02-29');
      expect(dates[2]).is.equal('2024-05-31');
      expect(dates[3]).is.equal('2024-08-31');
      expect(dates[4]).is.equal('2024-11-30');
      expect(dates[5]).is.equal('2025-02-28');
      expect(dates[6]).is.equal('2025-05-31');
      expect(dates[7]).is.equal('2025-08-31');
    });
  });
});
