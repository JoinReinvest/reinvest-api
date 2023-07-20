import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';

export enum WithdrawalsEvents {
  WithdrawalCreated = 'WithdrawalCreated',
  PushWithdrawalsDocumentCreation = 'PushWithdrawalsDocumentCreation',
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

export enum WithdrawalsStatus {
  PENDING = 'PENDING',
  READY_TO_SEND = 'READY_TO_SEND',
  COMPLETED = 'COMPLETED',
}

export type UUIDsList = {
  list: UUID[];
};

export type WithdrawalSchema = {
  dateCompleted: DateTime | null;
  dateCreated: DateTime;
  id: UUID;
  listOfDividends: UUIDsList;
  listOfWithdrawals: UUIDsList;
  payoutId: UUID;
  redemptionId: UUID | null;
  status: WithdrawalsStatus;
};

export type WithdrawalView = {
  dateCompleted: string | null;
  dateCreated: string;
  id: UUID;
  payoutId: UUID;
  redemptionId: UUID | null;
  status: WithdrawalsStatus;
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

  static create(id: UUID, payoutId: UUID, redemptionId: UUID | null, listOfDividends: UUIDsList, listOfWithdrawals: UUIDsList): Withdrawal {
    return new Withdrawal({
      dateCompleted: null,
      dateCreated: DateTime.now(),
      id,
      listOfDividends,
      listOfWithdrawals,
      payoutId,
      redemptionId,
      status: WithdrawalsStatus.PENDING,
    });
  }

  static restore(schema: WithdrawalSchema): Withdrawal {
    return new Withdrawal(schema);
  }

  getRedemptions(): {
    documentId: UUID | null;
    listOfWithdrawals: UUIDsList;
  } {
    return {
      documentId: this.withdrawalSchema.redemptionId,
      listOfWithdrawals: this.withdrawalSchema.listOfWithdrawals,
    };
  }

  getPayouts(): {
    documentId: UUID | null;
    listOfDividends: UUIDsList;
    listOfWithdrawals: UUIDsList;
  } {
    return {
      documentId: this.withdrawalSchema.payoutId,
      listOfWithdrawals: this.withdrawalSchema.listOfWithdrawals,
      listOfDividends: this.withdrawalSchema.listOfDividends,
    };
  }

  getView(): WithdrawalView {
    return {
      dateCompleted: this.withdrawalSchema.dateCompleted ? this.withdrawalSchema.dateCompleted.toIsoDateTime() : null,
      dateCreated: this.withdrawalSchema.dateCreated.toIsoDateTime(),
      id: this.withdrawalSchema.id,
      payoutId: this.withdrawalSchema.payoutId,
      redemptionId: this.withdrawalSchema.redemptionId,
      status: this.withdrawalSchema.status,
    };
  }

  markAsReadyToSend(generatedDocuments: UUID[]): boolean {
    if (this.withdrawalSchema.status !== WithdrawalsStatus.PENDING) {
      return false;
    }

    if (!generatedDocuments.includes(this.withdrawalSchema.payoutId)) {
      return false;
    }

    if (this.withdrawalSchema.redemptionId && !generatedDocuments.includes(this.withdrawalSchema.redemptionId)) {
      return false;
    }

    this.withdrawalSchema.status = WithdrawalsStatus.READY_TO_SEND;

    return true;
  }

  markAsCompleted(): boolean {
    if (this.withdrawalSchema.status === WithdrawalsStatus.COMPLETED) {
      return false;
    }

    this.withdrawalSchema.status = WithdrawalsStatus.COMPLETED;
    this.withdrawalSchema.dateCompleted = DateTime.now();

    return true;
  }
}
