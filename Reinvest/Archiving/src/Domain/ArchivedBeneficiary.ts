import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export enum ArchivingBeneficiaryStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// from id to id
export type TransferredInvestments = {
  newInvestmentId: UUID;
  previousInvestmentId: UUID;
};

export type TransferredShares = {
  newShareId: UUID;
  numberOfShares: number;
  previousShareId: UUID;
  price: number;
};

export type TransferredDividends = {
  newDividendId: UUID;
  previousDividendId: UUID;
};

export type AccountArchivingState = {
  isArchived: boolean;
  isRecurringInvestmentDisabled: boolean;
  transferredDividends: {
    areTransferred: boolean;
    dividends: TransferredDividends[];
  };
  transferredInvestments: {
    areTransferred: boolean;
    investments: TransferredInvestments[];
  };
  transferredShares: {
    areTransferred: boolean;
    shares: TransferredShares[];
  };
};

export type VertaloConfiguration = {
  configuration: {
    customerId: string | null;
    email: string | null;
    investorId: string | null;
  };
  isSet: boolean;
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
  vertaloConfiguration: VertaloConfiguration;
};

export type BeneficiaryTransferStats = {
  amountTransferred: number;
  name: string;
  numberOfInvestments: number;
  numberOfShares: number;
  transferredFrom: UUID;
  transferredTo: UUID;
};

export type VertaloMappingConfiguration = { customerId: string | null; email: string; investorId: string | null };

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
          investments: [],
        },
        transferredShares: {
          areTransferred: false,
          shares: [],
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
      vertaloConfiguration: {
        isSet: false,
        configuration: {
          investorId: null,
          email: null,
          customerId: null,
        },
      },
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

  setTransferredInvestments(transferredInvestments: TransferredInvestments[]) {
    this.archivingBeneficiarySchema.accountArchivingState.transferredInvestments.investments = transferredInvestments;
    this.archivingBeneficiarySchema.accountArchivingState.transferredInvestments.areTransferred = true;
  }

  setTransferredShares(transferredShares: TransferredShares[]) {
    this.archivingBeneficiarySchema.accountArchivingState.transferredShares.shares = transferredShares;
    this.archivingBeneficiarySchema.accountArchivingState.transferredShares.areTransferred = true;
  }

  setTransferredDividends(transferredDividends: TransferredDividends[]) {
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

  getTransferredInvestments(): TransferredInvestments[] {
    if (!this.areInvestmentsTransferred()) {
      return [];
    }

    return this.archivingBeneficiarySchema.accountArchivingState.transferredInvestments.investments;
  }

  getTransferredDividends(): TransferredDividends[] {
    if (!this.areDividendsTransferred()) {
      return [];
    }

    return this.archivingBeneficiarySchema.accountArchivingState.transferredDividends.dividends;
  }

  setCompleted(): void {
    this.archivingBeneficiarySchema.status = ArchivingBeneficiaryStatus.COMPLETED;
    this.archivingBeneficiarySchema.dateCompleted = DateTime.now();
  }

  isCompleted(): boolean {
    return this.archivingBeneficiarySchema.status === ArchivingBeneficiaryStatus.COMPLETED;
  }

  getTransfersStats(): BeneficiaryTransferStats {
    const shares = this.archivingBeneficiarySchema.accountArchivingState.transferredShares.shares;
    let numberOfShares = 0;
    let amountTransferred = 0;

    for (const share of shares) {
      numberOfShares += share.numberOfShares;
      amountTransferred += share.price;
    }

    return {
      amountTransferred,
      numberOfInvestments: this.archivingBeneficiarySchema.accountArchivingState.transferredInvestments.investments.length,
      numberOfShares,
      transferredFrom: this.archivingBeneficiarySchema.accountId,
      transferredTo: this.archivingBeneficiarySchema.parentId,
      name: this.archivingBeneficiarySchema.label,
    };
  }

  isVertaloConfigurationSet(): boolean {
    return this.archivingBeneficiarySchema.vertaloConfiguration?.isSet;
  }

  setVertaloConfiguration(vertaloConfiguration: VertaloMappingConfiguration | null): void {
    this.archivingBeneficiarySchema.vertaloConfiguration.isSet = true;

    if (vertaloConfiguration === null) {
      return;
    }

    this.archivingBeneficiarySchema.vertaloConfiguration.configuration = {
      customerId: vertaloConfiguration.customerId,
      email: vertaloConfiguration.email,
      investorId: vertaloConfiguration.investorId,
    };
  }
}
