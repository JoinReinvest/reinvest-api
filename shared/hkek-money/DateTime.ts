import dayjs from 'dayjs';

export class DateTime {
  private readonly date: dayjs.Dayjs;

  constructor(date: dayjs.Dayjs) {
    this.date = date;
  }

  static now(): DateTime {
    return new DateTime(dayjs());
  }

  static from(date: Date | string): DateTime {
    return new DateTime(dayjs(date));
  }

  static fromIsoDate(date: Date | string): DateTime {
    return new DateTime(dayjs(dayjs(date).format('YYYY-MM-DD')));
  }

  toDate(): Date {
    return this.date.toDate();
  }

  getInstance(): dayjs.Dayjs {
    return this.date;
  }

  isBeforeOrEqual(other: DateTime): boolean {
    return this.date.isBefore(other.getInstance()) || this.date.isSame(other.getInstance());
  }

  addDays(days: number): DateTime {
    return new DateTime(this.date.add(days, 'day'));
  }

  numberOfDaysBetween(other: DateTime): number {
    return this.date.diff(other.getInstance(), 'day');
  }

  toIsoDate(): string {
    return this.date.format('YYYY-MM-DD');
  }

  toIsoDateTime() {
    return this.date.format('YYYY-MM-DDTHH:mm:ss');
  }
}
