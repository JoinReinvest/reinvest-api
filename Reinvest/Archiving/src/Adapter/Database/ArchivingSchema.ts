import { ArchivingBeneficiaryStatus } from 'Archiving/Domain/ArchivedBeneficiary';
import { JSONObject } from 'HKEKTypes/Generics';

export interface ArchivingBeneficiaryTable {
  accountArchivingStateJson: JSONObject;
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
