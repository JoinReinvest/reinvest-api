import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

export type CalculatedDividendsList = {
  list: UUID[];
};

export type InvestorDividendSchema = {
  accountId: UUID;
  actionDate: Date | null;
  calculatedDividends: CalculatedDividendsList;
  createdDate: Date;
  distributionId: UUID;
  dividendAmount: number;
  feesCoveredByDividendId: UUID | null;
  id: UUID;
  profileId: UUID;
  status: InvestorDividendStatus;
  totalDividendAmount: number;
  totalFeeAmount: number;
  transferredId: UUID | null;
};

export enum InvestorDividendStatus {
  AWAITING_ACTION = 'AWAITING_ACTION',
  REINVESTED = 'REINVESTED',
  WITHDRAWN = 'WITHDRAWN',
  WITHDRAWING = 'WITHDRAWING',
  ZEROED = 'ZEROED',
  FEES_NOT_COVERED = 'FEES_NOT_COVERED',
  FEES_MOVED_TO_NEXT_DIVIDEND = 'FEES_MOVED_TO_NEXT_DIVIDEND',
  TRANSFERRED = 'TRANSFERRED',
}

export class InvestorDividend {
  private readonly id: UUID;
  private readonly createdDate: DateTime;
  private readonly profileId: UUID;
  private readonly distributionId: UUID;
  private readonly calculatedDividends: CalculatedDividendsList;
  private readonly totalDividendAmount: Money;
  private accountId: UUID;
  private totalFeeAmount: Money;
  private dividendAmount: Money;
  private status: InvestorDividendStatus = InvestorDividendStatus.AWAITING_ACTION;
  private actionDate: DateTime | null = null;
  private feesCoveredByDividendId: UUID | null = null;
  private transferredId: UUID | null = null;

  constructor(
    schema: null,
    id: UUID,
    profileId: UUID,
    accountId: UUID,
    distributionId: UUID,
    totalDividendAmount: Money,
    totalFeeAmount: Money,
    calculatedDividends: CalculatedDividendsList,
  );
  constructor(schema: InvestorDividendSchema);

  constructor(
    schema: InvestorDividendSchema | null,
    id?: UUID,
    profileId?: UUID,
    accountId?: UUID,
    distributionId?: UUID,
    totalDividendAmount?: Money,
    totalFeeAmount?: Money,
    calculatedDividends?: CalculatedDividendsList,
  ) {
    if (!schema) {
      this.id = id!;
      this.profileId = profileId!;
      this.accountId = accountId!;
      this.distributionId = distributionId!;
      this.totalFeeAmount = totalFeeAmount!;
      this.totalDividendAmount = totalDividendAmount!;
      this.dividendAmount = totalDividendAmount!.subtract(totalFeeAmount!);
      this.calculatedDividends = calculatedDividends!;
      this.createdDate = DateTime.now();
      this.transferredId = null;
      this.status = this.calculateStatus();
    } else {
      this.id = schema.id;
      this.profileId = schema.profileId;
      this.accountId = schema.accountId!;
      this.dividendAmount = new Money(schema.dividendAmount);
      this.totalFeeAmount = new Money(schema.totalFeeAmount);
      this.totalDividendAmount = new Money(schema.totalDividendAmount);
      this.createdDate = DateTime.from(schema.createdDate);
      this.distributionId = schema.distributionId;
      this.status = schema.status;
      this.calculatedDividends = schema.calculatedDividends;
      this.feesCoveredByDividendId = schema.feesCoveredByDividendId;
      this.actionDate = schema.actionDate ? DateTime.from(schema.actionDate) : null;
      this.transferredId = schema.transferredId;
    }
  }

  static restore(data: InvestorDividendSchema): InvestorDividend {
    return new InvestorDividend(data);
  }

  static create(
    id: UUID,
    profileId: UUID,
    accountId: UUID,
    distributionId: UUID,
    totalDividendAmount: Money,
    totalFeeAmount: Money,
    calculatedDividends: CalculatedDividendsList,
  ): InvestorDividend {
    return new InvestorDividend(null, id, profileId, accountId, distributionId, totalDividendAmount, totalFeeAmount, calculatedDividends);
  }

  setStatus(status: InvestorDividendStatus) {
    this.status = status;
    this.actionDate = DateTime.now();
  }

  setWithdrawn(accountId: string) {
    this.setStatus(InvestorDividendStatus.WITHDRAWN);
  }

  setReinvested(accountId: string) {
    this.setStatus(InvestorDividendStatus.REINVESTED);
  }

  getNotification() {
    return {
      dividendAmount: this.dividendAmount.getFormattedAmount(),
      dividendId: this.id,
      profileId: this.profileId,
      accountId: this.accountId,
    };
  }

  feeIsCoveredByDividend(coveredByDividendId: UUID): Money {
    this.feesCoveredByDividendId = coveredByDividendId;
    this.setStatus(InvestorDividendStatus.FEES_MOVED_TO_NEXT_DIVIDEND);

    return this.dividendAmount.multiplyBy(-1); // negative dividend amount is a totalFeeAmount to cover
  }

  toObject(): InvestorDividendSchema {
    return {
      id: this.id,
      profileId: this.profileId,
      accountId: this.accountId,
      distributionId: this.distributionId,
      dividendAmount: this.dividendAmount.getAmount(),
      totalFeeAmount: this.totalFeeAmount.getAmount(),
      totalDividendAmount: this.totalDividendAmount.getAmount(),
      calculatedDividends: this.calculatedDividends,
      createdDate: this.createdDate.toDate(),
      status: this.status,
      feesCoveredByDividendId: this.feesCoveredByDividendId,
      actionDate: this.actionDate ? this.actionDate.toDate() : null,
      transferredId: this.transferredId,
    };
  }

  coverExtraFee(extraFeeToCover: Money): void {
    this.totalFeeAmount = this.totalFeeAmount.add(extraFeeToCover);
    this.dividendAmount = this.dividendAmount.subtract(extraFeeToCover);
    this.status = this.calculateStatus();
  }

  shouldSendNotification(): boolean {
    return this.status === InvestorDividendStatus.AWAITING_ACTION;
  }

  private calculateStatus(): InvestorDividendStatus {
    if (this.dividendAmount.isZero()) {
      return InvestorDividendStatus.ZEROED;
    }

    if (this.dividendAmount.isNegative()) {
      return InvestorDividendStatus.FEES_NOT_COVERED;
    }

    return InvestorDividendStatus.AWAITING_ACTION;
  }

  isTransferred(): boolean {
    return this.transferredId !== null && this.status === InvestorDividendStatus.TRANSFERRED;
  }

  getTransferredFromId(): UUID {
    if (!this.transferredId) {
      throw new Error('Dividend is not transferred');
    }

    return this.transferredId;
  }

  getId(): UUID {
    return this.id;
  }

  transferDividend(newDividendTransferId: UUID, transferToAccountId: UUID): InvestorDividend {
    const schema = this.toObject();

    schema.id = newDividendTransferId;
    schema.transferredId = this.id;
    schema.status = InvestorDividendStatus.TRANSFERRED;
    this.accountId = transferToAccountId;

    return InvestorDividend.restore(schema);
  }
}
