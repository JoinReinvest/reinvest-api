import type { InvestmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

import { InvestmentsFeesStatus } from './Types';

type FeeSchema = InvestmentsFeesTable;

export class Fee {
  accountId: string;
  amount: number;
  approveDate: Date | null;
  approvedByIP: string | null;
  dateCreated: Date;
  id: string;
  investmentId: string;
  profileId: string;
  status: InvestmentsFeesStatus;
  verificationFeeId: string;

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
    this.status = InvestmentsFeesStatus.APPROVED;
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
