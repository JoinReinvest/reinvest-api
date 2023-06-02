import type { InvestmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

import { InvestmentsFeesStatus } from './Types';

export type FeeSchema = InvestmentsFeesTable;

export class Fee {
  private accountId: string;
  private amount: number;
  private approveDate: Date | null;
  private approvedByIP: string | null;
  private dateCreated: Date;
  private id: string;
  private investmentId: string;
  private profileId: string;
  private status: InvestmentsFeesStatus;
  private verificationFeeId: string;

  constructor(
    accountId: string,
    amount: number,
    approveDate: Date | null,
    approvedByIP: string | null,
    dateCreated: Date,
    id: string,
    investmentId: string,
    profileId: string,
    status: InvestmentsFeesStatus,
    verificationFeeId: string,
  ) {
    this.accountId = accountId;
    this.amount = amount;
    this.approveDate = approveDate;
    this.approvedByIP = approvedByIP;
    this.dateCreated = dateCreated;
    this.id = id;
    this.investmentId = investmentId;
    this.profileId = profileId;
    this.status = status;
    this.verificationFeeId = verificationFeeId;
  }

  static create(data: FeeSchema) {
    const { accountId, amount, approveDate, approvedByIP, dateCreated, id, investmentId, profileId, status, verificationFeeId } = data;

    return new Fee(accountId, amount, approveDate, approvedByIP, dateCreated, id, investmentId, profileId, status, verificationFeeId);
  }

  approveFee() {
    this.approveDate = new Date();
    this.status = InvestmentsFeesStatus.APPROVED;
  }

  getId() {
    return this.id;
  }

  abort() {
    this.status = InvestmentsFeesStatus.ABORTED;
  }

  isApproved() {
    return this.status === InvestmentsFeesStatus.APPROVED;
  }

  toObject() {
    return {
      accountId: this.accountId,
      amount: this.amount,
      approveDate: this.approveDate,
      approvedByIP: this.approvedByIP,
      dateCreated: this.dateCreated,
      id: this.id,
      investmentId: this.investmentId,
      profileId: this.profileId,
      status: this.status,
      verificationFeeId: this.verificationFeeId,
    };
  }
}
