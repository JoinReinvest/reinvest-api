import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export enum RecurringInvestmentExecutionInvestmentStatus {
  PENDING = 'PENDING',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
}

export interface RecurringInvestmentExecutionSchema {
  dateCreated: DateTime;
  executionDate: DateTime;
  id: UUID;
  investmentId: UUID;
  investmentStatus: RecurringInvestmentExecutionInvestmentStatus;
  recurringInvestmentId: UUID;
}

export class RecurringInvestmentExecution {
  private schema: RecurringInvestmentExecutionSchema;

  constructor(schema: RecurringInvestmentExecutionSchema) {
    this.schema = schema;
  }

  static create(id: UUID, recurringInvestmentId: UUID, investmentId: UUID, executionDate: DateTime): RecurringInvestmentExecution {
    return new RecurringInvestmentExecution({
      id,
      recurringInvestmentId,
      investmentId,
      executionDate: executionDate,
      dateCreated: DateTime.now(),
      investmentStatus: RecurringInvestmentExecutionInvestmentStatus.PENDING,
    });
  }

  static restore(schema: RecurringInvestmentExecutionSchema): RecurringInvestmentExecution {
    return new RecurringInvestmentExecution(schema);
  }

  toObject(): RecurringInvestmentExecutionSchema {
    return this.schema;
  }

  getExecutionDate(): DateTime {
    return this.schema.executionDate;
  }

  paymentSucceeded() {
    this.schema.investmentStatus = RecurringInvestmentExecutionInvestmentStatus.PAYMENT_SUCCEEDED;
  }

  canceled() {
    this.schema.investmentStatus = RecurringInvestmentExecutionInvestmentStatus.CANCELED;
  }

  paymentFailed() {
    this.schema.investmentStatus = RecurringInvestmentExecutionInvestmentStatus.PAYMENT_FAILED;
  }

  failed() {
    if (this.schema.investmentStatus === RecurringInvestmentExecutionInvestmentStatus.PAYMENT_FAILED) {
      return;
    }

    this.schema.investmentStatus = RecurringInvestmentExecutionInvestmentStatus.FAILED;
  }

  completed() {
    this.schema.investmentStatus = RecurringInvestmentExecutionInvestmentStatus.COMPLETED;
  }

  getRecurringId(): UUID {
    return this.schema.recurringInvestmentId;
  }

  isPaymentFailed(): boolean {
    return this.schema.investmentStatus === RecurringInvestmentExecutionInvestmentStatus.PAYMENT_FAILED;
  }
}
