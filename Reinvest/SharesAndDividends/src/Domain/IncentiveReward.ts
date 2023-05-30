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
  rewardType: RewardType;
  status: IncentiveRewardStatus;
  theOtherProfileId: string;
};

export enum IncentiveRewardStatus {
  AWAITING_ACTION = 'AWAITING_ACTION',
  REINVESTED = 'REINVESTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum RewardType {
  INVITEE = 'INVITEE',
  INVITER = 'INVITER',
}

export class IncentiveReward {
  private readonly id: string;
  private readonly profileId: string;
  private readonly amount: Money;
  private readonly createdDate: Date;
  private status: IncentiveRewardStatus = IncentiveRewardStatus.AWAITING_ACTION;
  private rewardType: RewardType;
  private theOtherProfileId: string;
  private actionDate: Date | null = null;
  private assignedToAccountId: string | null = null;

  constructor(id: string, profileId: string, amount: Money, createdDate: Date, rewardType: RewardType, theOtherProfileId: string) {
    this.rewardType = rewardType;
    this.theOtherProfileId = theOtherProfileId;
    this.id = id;
    this.profileId = profileId;
    this.amount = amount;
    this.createdDate = createdDate;
  }

  static restore(data: IncentiveRewardSchema): IncentiveReward {
    const { id, profileId, amount, createdDate, rewardType, theOtherProfileId } = data;
    const reward = new IncentiveReward(id, profileId, new Money(amount), dayjs(createdDate).toDate(), rewardType, theOtherProfileId);

    if (data.status !== IncentiveRewardStatus.AWAITING_ACTION && data.accountId !== null) {
      reward.setStatus(data.status, dayjs(data.actionDate).toDate(), data.accountId);
    }

    return reward;
  }

  static createReward(id: string, profileId: string, theOtherProfileId: string, rewardType: RewardType): IncentiveReward {
    return new IncentiveReward(id, profileId, INCENTIVE_REWARD, new Date(), rewardType, theOtherProfileId);
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

  getNotification() {
    return {
      amount: this.amount.getFormattedAmount(),
      id: this.id,
      rewardType: this.rewardType,
    };
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
      rewardType: this.rewardType,
      theOtherProfileId: this.theOtherProfileId,
    };
  }
}
