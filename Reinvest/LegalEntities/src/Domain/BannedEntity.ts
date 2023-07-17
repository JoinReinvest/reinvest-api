export enum BannedType {
  PROFILE = 'PROFILE',
  COMPANY = 'COMPANY',
  STAKEHOLDER = 'STAKEHOLDER',
}

export type BannedEntity = {
  accountId: string | null;
  anonymizedSensitiveNumber: string;
  dateCancelled: Date | null;
  dateCreated: Date;
  id: string;
  profileId: string;
  reasons: string;
  sensitiveNumber: string;
  stakeholderId: string | null;
  status: 'ACTIVE' | 'CANCELLED';
  type: BannedType;
};
