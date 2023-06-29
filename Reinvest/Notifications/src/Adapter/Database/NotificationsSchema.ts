import { JSONObject } from 'HKEKTypes/Generics';

export interface NotificationsTable {
  accountId: string | null;
  body: string;
  dateCreated: Date;
  dateRead: Date | null;
  dismissId: string;
  header: string;
  id: string;
  isDismissible: boolean;
  isRead: boolean;
  notificationType: string;
  onObjectId: string | null;
  onObjectType: string | null;
  profileId: string;
  uniqueId: string | null;
}

export interface StoredEventsTable {
  dateAccountActivity: Date | null;
  dateAnalytics: Date | null;
  dateCreated: Date;
  dateEmailed: Date | null;
  dateInApp: Date | null;
  datePushed: Date | null;
  id: string;
  kind: string;
  payloadJson: JSONObject;
  profileId: string;
  status: string;
}
