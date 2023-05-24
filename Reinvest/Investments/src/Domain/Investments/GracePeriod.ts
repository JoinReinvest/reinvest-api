import dayjs from 'dayjs';

const GRACE_PERIOD_IN_MINUTES = 30 * 24 * 60;

export class GracePeriod {
  private investmentCreatedDate: Date;

  constructor(investmentCreatedDate: Date) {
    this.investmentCreatedDate = investmentCreatedDate;
  }

  isGracePeriodEnded = (): boolean => {
    const gradePeriodEnds = dayjs(this.investmentCreatedDate).add(GRACE_PERIOD_IN_MINUTES, 'minute');
    const now = dayjs();

    return gradePeriodEnds.isBefore(now, 'minute');
  };
}
