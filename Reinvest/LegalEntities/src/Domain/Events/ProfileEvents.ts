import { DomainEvent } from 'SimpleAggregator/Types';

export type LegalProfileCompleted = DomainEvent & {
  kind: 'LegalProfileCompleted';
};

export enum UpdatedObjectType {
  PROFILE = 'PROFILE',
  ACCOUNT = 'ACCOUNT',
  STAKEHOLDER = 'STAKEHOLDER',
}

export type SensitiveDataUpdated = DomainEvent & {
  data: {
    accountId: string | null;
    profileId: string;
    stakeholderId: string | null;
    type: UpdatedObjectType;
  };
  kind: 'SensitiveDataUpdated';
};

export const sensitiveDataUpdated = (
  type: UpdatedObjectType,
  profileId: string,
  accountId: string | null = null,
  stakeholderId: string | null = null,
): SensitiveDataUpdated => ({
  data: {
    accountId,
    profileId,
    stakeholderId,
    type,
  },
  kind: 'SensitiveDataUpdated',
  id: profileId,
});
