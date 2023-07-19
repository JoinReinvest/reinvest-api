import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';

export enum WithdrawalsEvents {
  WithdrawalCreated = 'WithdrawalCreated',
}

export type WithdrawalsEvent = DomainEvent & {
  data: {
    listOfDividends: UUIDsList;
    listOfWithdrawals: UUIDsList;
    payoutId: UUID;
    redemptionId: UUID;
  };
  id: UUID;
  kind: WithdrawalsEvents;
};

export enum WithdrawalsStatuses {
  PENDING = 'PENDING',
  READY_TO_SEND = 'READY_TO_SEND',
  COMPLETED = 'COMPLETED',
}
export type UUIDsList = {
  list: UUID[];
};

type WithdrawalSchema = {
  dateCompleted: DateTime | null;
  dateCreated: DateTime;
  id: UUID;
  listOfDividends: UUIDsList;
  listOfWithdrawals: UUIDsList;
  payoutId: UUID;
  redemptionId: UUID;
  status: WithdrawalsStatuses;
};

export class Withdrawal {
  private readonly withdrawalSchema: WithdrawalSchema;

  constructor(withdrawalSchema: WithdrawalSchema) {
    this.withdrawalSchema = withdrawalSchema;
  }

  getId(): UUID {
    return this.withdrawalSchema.id;
  }

  toObject(): WithdrawalSchema {
    return this.withdrawalSchema;
  }

  static create(schema: WithdrawalSchema): Withdrawal {
    return new Withdrawal(schema);
  }
}
