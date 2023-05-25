import dayjs from 'dayjs';

const GRACE_PERIOD_IN_MINUTES = 30 * 24 * 60;

export class GracePeriod {
  private investmentStartedDate: Date | null;

  constructor(investmentStartedDate: Date | null) {
    this.investmentStartedDate = investmentStartedDate;
  }

  isGracePeriodEnded = (): boolean => {
    if (!this.investmentStartedDate) {
      return false;
    }

    const gradePeriodEnds = dayjs(this.investmentStartedDate).add(GRACE_PERIOD_IN_MINUTES, 'minute');
    const now = dayjs();

    return gradePeriodEnds.isBefore(now, 'minute');
  };
}
