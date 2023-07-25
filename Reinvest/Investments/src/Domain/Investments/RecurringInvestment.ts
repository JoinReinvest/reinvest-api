import { UUID } from 'HKEKTypes/Generics';
import ScheduleInvestmentService from 'Investments/Domain/Service/ScheduleInvestmentService';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from './Types';

export interface RecurringInvestmentSchema {
  accountId: UUID;
  amount: Money;
  dateCreated: DateTime;
  frequency: RecurringInvestmentFrequency;
  id: UUID;
  nextDate: DateTime;
  portfolioId: UUID;
  profileId: UUID;
  startDate: DateTime;
  status: RecurringInvestmentStatus;
  subscriptionAgreementId: UUID | null;
}

export class RecurringInvestment {
  private schema: RecurringInvestmentSchema;

  constructor(schema: RecurringInvestmentSchema) {
    this.schema = schema;
  }

  static create(
    id: UUID,
    profileId: UUID,
    accountId: UUID,
    portfolioId: UUID,
    frequency: RecurringInvestmentFrequency,
    startDate: DateTime,
    amount: Money,
  ): RecurringInvestment {
    return new RecurringInvestment({
      accountId,
      amount,
      dateCreated: DateTime.now(),
      frequency,
      id,
      portfolioId,
      profileId,
      startDate,
      nextDate: startDate,
      status: RecurringInvestmentStatus.DRAFT,
      subscriptionAgreementId: null,
    });
  }

  static restore(schema: RecurringInvestmentSchema): RecurringInvestment {
    return new RecurringInvestment(schema);
  }

  getAmount(): {
    formatted: string;
    value: number;
  } {
    return {
      formatted: this.schema.amount.getFormattedAmount(),
      value: this.schema.amount.getAmount(),
    };
  }

  assignSubscriptionAgreement(id: UUID) {
    this.schema.subscriptionAgreementId = id;
  }

  deactivate() {
    this.schema.status = RecurringInvestmentStatus.INACTIVE;
  }

  activate() {
    this.schema.status = RecurringInvestmentStatus.ACTIVE;
  }

  getStatus() {
    return this.schema.status;
  }

  setNextDate(date: DateTime): void {
    this.schema.nextDate = date;
  }

  getId() {
    return this.schema.id;
  }

  isReadyToActivate() {
    return !!this.schema.subscriptionAgreementId;
  }

  toObject(): RecurringInvestmentSchema {
    return this.schema;
  }

  isActive(): boolean {
    return this.schema.status === RecurringInvestmentStatus.ACTIVE;
  }

  getNextExecutionDate(lastExecutionDate: DateTime | null): DateTime {
    const calculationService = new ScheduleInvestmentService(this.schema.startDate, this.schema.frequency);

    return calculationService.getNextInvestmentDate(lastExecutionDate);
  }

  canBeExecuted(lastExecutionDate: DateTime | null): boolean {
    const nextExecutionDate = this.getNextExecutionDate(lastExecutionDate);

    return nextExecutionDate.isBeforeOrEqual(DateTime.nowIsoDate());
  }

  setNextExecutionDate(lastExecutionDate: DateTime): void {
    this.schema.nextDate = this.getNextExecutionDate(lastExecutionDate);
  }

  suspend(): void {
    this.schema.status = RecurringInvestmentStatus.SUSPENDED;
  }

  forEvent() {
    return {
      accountId: this.schema.accountId,
      amount: this.schema.amount.getAmount(),
      dateCreated: this.schema.dateCreated.toIsoDateTime(),
      frequency: this.schema.frequency,
      recurringId: this.schema.id,
      portfolioId: this.schema.portfolioId,
      subscriptionAgreementId: this.schema.subscriptionAgreementId,
      startDate: this.schema.startDate.toIsoDate(),
      status: this.schema.status,
    };
  }
}
