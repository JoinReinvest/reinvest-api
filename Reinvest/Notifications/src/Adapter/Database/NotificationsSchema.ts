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
