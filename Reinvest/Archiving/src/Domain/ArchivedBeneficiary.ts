import { JSONObject, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export enum ArchivingBeneficiaryStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// from id to id
export type TransferredInvestments = {
  [fromInvestmentId: UUID]: UUID;
};

export type AccountArchivingState = {
  isArchived: boolean;
  isRecurringInvestmentDisabled: boolean;
  transferredDividends: {
    areTransferred: boolean;
    dividends: UUID[];
  };
  transferredInvestments: {
    areTransferred: boolean;
    investments: TransferredInvestments;
  };
  transferredShares: {
    areTransferred: boolean;
    shares: any;
  };
};

export type ArchivingBeneficiarySchema = {
  accountArchivingState: AccountArchivingState;
  accountId: UUID;
  dateCompleted: DateTime | null;
  dateCreated: DateTime;
  id: UUID;
  label: string;
  parentId: UUID;
  profileId: UUID;
  status: ArchivingBeneficiaryStatus;
  vertaloConfiguration: JSONObject;
};

export class ArchivedBeneficiary {
  private archivingBeneficiarySchema: ArchivingBeneficiarySchema;

  constructor(archivingBeneficiarySchema: ArchivingBeneficiarySchema) {
    this.archivingBeneficiarySchema = archivingBeneficiarySchema;
  }

  static create(id: UUID, profileId: UUID, accountId: UUID, parentId: UUID, label: string): ArchivedBeneficiary {
    return new ArchivedBeneficiary({
      accountArchivingState: {
        isArchived: false,
        transferredInvestments: {
          areTransferred: false,
          investments: {},
        },
        transferredShares: {
          areTransferred: false,
          shares: {},
        },
        transferredDividends: {
          areTransferred: false,
          dividends: [],
        },
        isRecurringInvestmentDisabled: false,
      },
      accountId,
      dateCompleted: null,
      dateCreated: DateTime.now(),
      id,
      label,
      parentId,
      profileId,
      status: ArchivingBeneficiaryStatus.IN_PROGRESS,
      vertaloConfiguration: {},
    });
  }

  static restore(archivingBeneficiarySchema: ArchivingBeneficiarySchema): ArchivedBeneficiary {
    return new ArchivedBeneficiary(archivingBeneficiarySchema);
  }

  toObject(): ArchivingBeneficiarySchema {
    return this.archivingBeneficiarySchema;
  }

  getParentId(): UUID {
    return this.archivingBeneficiarySchema.parentId;
  }

  setAccountAsArchived() {
    this.archivingBeneficiarySchema.accountArchivingState.isArchived = true;
  }

  setTransferredInvestments(transferredInvestments: TransferredInvestments) {
    this.archivingBeneficiarySchema.accountArchivingState.transferredInvestments.investments = transferredInvestments;
    this.archivingBeneficiarySchema.accountArchivingState.transferredInvestments.areTransferred = true;
  }

  setTransferredShares(transferredShares: any) {
    this.archivingBeneficiarySchema.accountArchivingState.transferredShares.shares = transferredShares;
    this.archivingBeneficiarySchema.accountArchivingState.transferredShares.areTransferred = true;
  }

  setTransferredDividends(transferredDividends: any) {
    this.archivingBeneficiarySchema.accountArchivingState.transferredDividends.dividends = transferredDividends;
    this.archivingBeneficiarySchema.accountArchivingState.transferredDividends.areTransferred = true;
  }

  setRecurringInvestmentDisabled() {
    this.archivingBeneficiarySchema.accountArchivingState.isRecurringInvestmentDisabled = true;
  }

  isArchived(): boolean {
    return this.archivingBeneficiarySchema.accountArchivingState.isArchived;
  }

  areSharesTransferred(): boolean {
    return this.archivingBeneficiarySchema.accountArchivingState.transferredShares.areTransferred;
  }

  areDividendsTransferred(): boolean {
    return this.archivingBeneficiarySchema.accountArchivingState.transferredDividends.areTransferred;
  }

  areInvestmentsTransferred() {
    return this.archivingBeneficiarySchema.accountArchivingState.transferredInvestments.areTransferred;
  }

  isRecurringInvestmentDisabled(): boolean {
    return this.archivingBeneficiarySchema.accountArchivingState.isRecurringInvestmentDisabled;
  }
}
