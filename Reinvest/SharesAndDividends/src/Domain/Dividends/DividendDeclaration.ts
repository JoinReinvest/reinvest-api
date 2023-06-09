import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

export type DividendsDeclarationSchema = {
  calculatedFromDate: Date;
  calculatedToDate: Date;
  calculationFinishedDate: Date | null;
  createdDate: Date;
  id: string;
  numberOfDays: number;
  numberOfShares: NumberOfSharesPerDay;
  portfolioId: string;
  status: 'CALCULATING' | 'CALCULATED';
  totalDividendAmount: number;
  unitAmountPerDay: number;
};

export type NumberOfSharesPerDay = {
  days: {
    [isoDate: string]: number;
  };
};

export class DividendDeclaration {
  private portfolioId: string;
  private amount: Money;
  private calculatedFromDate: DateTime;
  private calculatedToDate: DateTime;
  private calculationFinishedDate: DateTime | null;
  private id: string;
  private createdDate: DateTime;
  private numberOfDays: number;
  private numberOfShares: NumberOfSharesPerDay;
  private status: 'CALCULATING' | 'CALCULATED';
  private unitAmountPerDay: Money;

  constructor(
    schema: null,
    id: string,
    portfolioId: string,
    amount: Money,
    numberOfShares: NumberOfSharesPerDay,
    calculatedFromDate: DateTime,
    calculatedToDate: DateTime,
  );
  constructor(schema: DividendsDeclarationSchema);

  constructor(
    schema: DividendsDeclarationSchema | null,
    id?: string,
    portfolioId?: string,
    amount?: Money,
    numberOfShares?: NumberOfSharesPerDay,
    calculatedFromDate?: DateTime,
    calculatedToDate?: DateTime,
  ) {
    if (!schema) {
      this.id = id!;
      this.portfolioId = portfolioId!;
      this.calculatedFromDate = calculatedFromDate!;
      this.calculatedToDate = calculatedToDate!;
      this.calculationFinishedDate = null;
      this.createdDate = DateTime.now();
      this.amount = amount!;
      this.numberOfShares = numberOfShares!;
      this.numberOfDays = this.calculateNumberOfDays();
      this.unitAmountPerDay = this.calculateUnitAmountPerDay();
      this.status = 'CALCULATING';
    } else {
      this.id = schema.id;
      this.portfolioId = schema.portfolioId;
      this.calculatedFromDate = DateTime.fromIsoDate(schema.calculatedFromDate);
      this.calculatedToDate = DateTime.fromIsoDate(schema.calculatedToDate);
      this.createdDate = DateTime.from(schema.createdDate);
      this.calculationFinishedDate = schema.calculationFinishedDate ? DateTime.fromIsoDate(schema.calculationFinishedDate) : null;
      this.amount = new Money(schema.totalDividendAmount);
      this.numberOfShares = schema.numberOfShares;
      this.numberOfDays = schema.numberOfDays;
      this.unitAmountPerDay = new Money(schema.unitAmountPerDay);
      this.status = schema.status;
    }
  }

  static create(
    id: string,
    portfolioId: string,
    amount: Money,
    numberOfShares: NumberOfSharesPerDay,
    calculatedFromDate: DateTime,
    calculatedToDate: DateTime,
  ): DividendDeclaration {
    return new DividendDeclaration(null, id, portfolioId, amount, numberOfShares, calculatedFromDate, calculatedToDate);
  }

  static restore(data: DividendsDeclarationSchema): DividendDeclaration {
    return new DividendDeclaration(data);
  }

  toObject(): DividendsDeclarationSchema {
    return {
      calculatedFromDate: this.calculatedFromDate.toDate(),
      calculatedToDate: this.calculatedToDate.toDate(),
      calculationFinishedDate: this.calculationFinishedDate ? this.calculationFinishedDate.toDate() : null,
      createdDate: this.createdDate.toDate(),
      id: this.id,
      numberOfDays: this.numberOfDays,
      numberOfShares: this.numberOfShares,
      portfolioId: this.portfolioId,
      status: this.status,
      totalDividendAmount: this.amount.getAmount(),
      unitAmountPerDay: this.unitAmountPerDay.getAmount(),
    };
  }

  getFormattedAmount(): string {
    return this.amount.getFormattedAmount();
  }

  getFormattedUnitAmountPerDay(): string {
    return this.unitAmountPerDay.getFormattedAmount();
  }

  private calculateNumberOfDays(): number {
    return this.calculatedToDate.numberOfDaysBetween(this.calculatedFromDate);
  }

  private calculateUnitAmountPerDay(): Money {
    return this.amount.divideBy(this.numberOfDays);
  }
}
