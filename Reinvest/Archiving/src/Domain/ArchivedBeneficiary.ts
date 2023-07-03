import { JSONObject, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';

export enum ArchivingBeneficiaryStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type ArchivingBeneficiarySchema = {
  accountArchivingState: JSONObject;
  accountId: UUID;
  dateCompleted: DateTime | null;
  dateCreated: DateTime;
  id: UUID;
  investmentTransferState: JSONObject;
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
      accountArchivingState: {},
      accountId,
      dateCompleted: null,
      dateCreated: DateTime.now(),
      id,
      investmentTransferState: {},
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
}
