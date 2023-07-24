import dayjs from 'dayjs';

export class DateTime {
  private readonly date: dayjs.Dayjs;

  constructor(date: dayjs.Dayjs) {
    this.date = date;
  }

  static now(): DateTime {
    return new DateTime(dayjs());
  }

  static nowIsoDate(): DateTime {
    return DateTime.fromIsoDate(DateTime.now().toDate());
  }

  static from(date: Date | string): DateTime {
    return new DateTime(dayjs(date));
  }

  static fromIsoDate(date: Date | string): DateTime {
    return new DateTime(dayjs(dayjs(date).format('YYYY-MM-DD')));
  }

  static daysAgo(days: number) {
    return DateTime.now().subtractDays(days);
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

  isBefore(other: DateTime): boolean {
    return this.date.isBefore(other.getInstance());
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

  isToday() {
    return this.date.isSame(dayjs(), 'day');
  }

  isFuture() {
    return this.date.isAfter(dayjs(), 'day');
  }

  subtractDays(days: number): DateTime {
    return new DateTime(this.date.subtract(days, 'day'));
  }

  toFormattedDate(dateFormat: string) {
    return this.date.format(dateFormat);
  }

  addSeconds(numberOfSeconds: number): DateTime {
    return new DateTime(this.date.add(numberOfSeconds, 'second'));
  }

  addMinutes(expirationInMinutes: number): DateTime {
    return new DateTime(this.date.add(expirationInMinutes, 'minute'));
  }

  static isInFormat(date: string, format: string): boolean {
    return dayjs(date, format).isValid();
  }

  toTimestamp(): number {
    return this.date.unix();
  }

  add(value: number, type: 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'): DateTime {
    return new DateTime(this.date.add(value, type));
  }
}
