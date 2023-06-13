import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

export enum DividendDeclarationStatus {
  CALCULATING = 'CALCULATING',
  CALCULATED = 'CALCULATED',
}

export type DividendsDeclarationSchema = {
  calculatedFromDate: Date;
  calculatedToDate: Date;
  calculationFinishedDate: Date | null;
  createdDate: Date;
  id: UUID;
  numberOfDays: number;
  numberOfShares: NumberOfSharesPerDay;
  portfolioId: UUID;
  status: DividendDeclarationStatus;
  totalDividendAmount: number;
  unitAmountPerDay: number;
};

export type NumberOfSharesPerDay = {
  days: {
    [isoDate: string]: number;
  };
};

export class DividendDeclaration {
  private portfolioId: UUID;
  private amount: Money;
  private calculatedFromDate: DateTime;
  private calculatedToDate: DateTime;
  private calculationFinishedDate: DateTime | null;
  private id: UUID;
  private createdDate: DateTime;
  private numberOfDays: number;
  private numberOfShares: NumberOfSharesPerDay;
  private status: DividendDeclarationStatus;
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
    id?: UUID,
    portfolioId?: UUID,
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
      this.status = DividendDeclarationStatus.CALCULATING;
    } else {
      this.id = schema.id;
      this.portfolioId = schema.portfolioId;
      this.calculatedFromDate = DateTime.fromIsoDate(schema.calculatedFromDate);
      this.calculatedToDate = DateTime.fromIsoDate(schema.calculatedToDate);
      this.createdDate = DateTime.from(schema.createdDate);
      this.calculationFinishedDate = schema.calculationFinishedDate ? DateTime.fromIsoDate(schema.calculationFinishedDate) : null;
      this.amount = Money.lowPrecision(schema.totalDividendAmount);
      this.numberOfShares = schema.numberOfShares;
      this.numberOfDays = schema.numberOfDays;
      this.unitAmountPerDay = Money.lowPrecision(schema.unitAmountPerDay);
      this.status = schema.status;
    }
  }

  static create(
    id: UUID,
    portfolioId: UUID,
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

  forFindingSharesToCalculate(): { declarationId: UUID; portfolioId: UUID; toDate: DateTime } {
    return {
      portfolioId: this.portfolioId,
      declarationId: this.id,
      toDate: this.calculatedToDate,
    };
  }

  isCalculated(): boolean {
    return this.status === DividendDeclarationStatus.CALCULATED;
  }

  calculateDividendAmountForShares(
    sharesDateFunding: DateTime,
    investorNumberOfShares: number,
  ): {
    dividendAmount: Money;
    numberOfDaysInvestorOwnsShares: number; // in this dividend cycle
  } {
    let dividendAmount = Money.zero().increasePrecision();
    const unitAmountPerDay = this.unitAmountPerDay.increasePrecision();
    let currentDate = this.calculatedFromDate;
    let numberOfDaysInvestorOwnsShares = 0;
    do {
      if (currentDate.isBefore(sharesDateFunding)) {
        currentDate = currentDate.addDays(1);
        continue; // investor did not have shares on this daya
      }

      numberOfDaysInvestorOwnsShares++;
      const currentDay = currentDate.toIsoDate();
      const numberOfSharesInCirculationInCurrentDay = this.numberOfShares.days[currentDay];

      if (!numberOfSharesInCirculationInCurrentDay) {
        currentDate = currentDate.addDays(1);
        continue;
      }

      const amountPerShareForCurrentDay = unitAmountPerDay.divideBy(numberOfSharesInCirculationInCurrentDay);
      const dividendAmountForCurrentDay = amountPerShareForCurrentDay.multiplyBy(investorNumberOfShares);

      dividendAmount = dividendAmount.add(dividendAmountForCurrentDay);
      currentDate = currentDate.addDays(1);
    } while (currentDate.isBeforeOrEqual(this.calculatedToDate));

    return {
      dividendAmount: dividendAmount.decreasePrecision(),
      numberOfDaysInvestorOwnsShares,
    };
  }

  finishCalculation() {
    this.status = DividendDeclarationStatus.CALCULATED;
    this.calculationFinishedDate = DateTime.now();
  }

  private calculateNumberOfDays(): number {
    return this.calculatedToDate.numberOfDaysBetween(this.calculatedFromDate) + 1; // including start date also
  }

  private calculateUnitAmountPerDay(): Money {
    const amount = this.amount.increasePrecision();

    return amount.divideBy(this.numberOfDays).decreasePrecision();
  }
}
