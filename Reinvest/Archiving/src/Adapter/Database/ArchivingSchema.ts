import { AccountArchivingState, ArchivingBeneficiaryStatus, VertaloConfiguration } from 'Archiving/Domain/ArchivedBeneficiary';
import { JSONObjectOf } from 'HKEKTypes/Generics';

export interface ArchivingBeneficiaryTable {
  accountArchivingStateJson: JSONObjectOf<AccountArchivingState>;
  accountId: string;
  dateCompleted: Date | null;
  dateCreated: Date;
  id: string;
  label: string;
  parentId: string;
  profileId: string;
  status: ArchivingBeneficiaryStatus;
  vertaloConfigurationJson: JSONObjectOf<VertaloConfiguration>;
}
