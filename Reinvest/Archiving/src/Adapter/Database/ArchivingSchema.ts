import { AccountArchivingState, ArchivingBeneficiaryStatus } from 'Archiving/Domain/ArchivedBeneficiary';
import { JSONObject, JSONObjectOf } from 'HKEKTypes/Generics';

export interface ArchivingBeneficiaryTable {
  accountArchivingStateJson: JSONObjectOf<AccountArchivingState>;
  accountId: string;
  dateCompleted: Date | null;
  dateCreated: Date;
  id: string;
  investmentTransferStateJson: JSONObject;
  label: string;
  parentId: string;
  profileId: string;
  status: ArchivingBeneficiaryStatus;
  vertaloConfigurationJson: JSONObject;
}
