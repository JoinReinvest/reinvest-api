import dayjs from 'dayjs';
import { Money } from 'Money/Money';

const INCENTIVE_REWARD = new Money(1000); // $10

export type IncentiveRewardSchema = {
  accountId: string | null;
  actionDate: Date | string | null;
  amount: number;
  createdDate: Date | string;
  id: string;
  profileId: string;
  status: IncentiveRewardStatus;
};

export enum IncentiveRewardStatus {
  AWAITING_ACTION = 'AWAITING_ACTION',
  REINVESTED = 'REINVESTED',
  WITHDRAWN = 'WITHDRAWN',
}

export class IncentiveReward {
  private readonly id: string;
  private readonly profileId: string;
  private readonly amount: Money;
  private readonly createdDate: Date;
  private status: IncentiveRewardStatus = IncentiveRewardStatus.AWAITING_ACTION;
  private actionDate: Date | null = null;
  private assignedToAccountId: string | null = null;

  constructor(id: string, profileId: string, amount: Money, createdDate: Date) {
    this.id = id;
    this.profileId = profileId;
    this.amount = amount;
    this.createdDate = createdDate;
  }

  static restore(data: IncentiveRewardSchema): IncentiveReward {
    const amount = new IncentiveReward(data.id, data.profileId, new Money(data.amount), dayjs(data.createdDate).toDate());

    if (data.status !== IncentiveRewardStatus.AWAITING_ACTION && data.accountId !== null) {
      amount.setStatus(data.status, dayjs(data.actionDate).toDate(), data.accountId);
    }

    return amount;
  }

  static createAndAssignTo(id: string, profileId: string): IncentiveReward {
    return new IncentiveReward(id, profileId, INCENTIVE_REWARD, new Date());
  }

  setStatus(status: IncentiveRewardStatus, date: Date, assignedToAccountId: string) {
    this.status = status;
    this.actionDate = date;
    this.assignedToAccountId = assignedToAccountId;
  }

  setWithdrawn(accountId: string) {
    this.setStatus(IncentiveRewardStatus.WITHDRAWN, new Date(), accountId);
  }

  setReinvested(accountId: string) {
    this.setStatus(IncentiveRewardStatus.REINVESTED, new Date(), accountId);
  }

  toObject(): IncentiveRewardSchema {
    return {
      id: this.id,
      profileId: this.profileId,
      amount: this.amount.getAmount(),
      createdDate: this.createdDate,
      status: this.status,
      accountId: this.assignedToAccountId,
      actionDate: this.actionDate,
    };
  }
}
