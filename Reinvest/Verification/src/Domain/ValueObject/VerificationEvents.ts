export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISAPPROVED = 'DISAPPROVED',
}

export type VerificationEvent = {
  date: Date;
  kind: string;
  ncId: string;
};

export type VerificationResultEvent = VerificationEvent & {
  eventId: string;
  kind: 'VerificationResult';
  reasons: string[];
  source: 'DIRECT' | 'EVENT';
  status: VerificationStatus;
  type: 'AML' | 'KYC';
  verificationWay: 'MANUAL' | 'AUTOMATIC';
};

export type VerificationAdministrativeEvent = VerificationEvent & {
  kind: 'VerificationAdministrativeEvent';
  name: 'PROFILE_UNBANNED' | 'ACCOUNT_UNBANNED' | 'VERIFICATION_CLEANED' | 'VERIFICATION_RECOVERED';
};

export type VerificationUserEvent = VerificationEvent & {
  kind: 'VerificationUserEvent';
  name: 'OBJECT_UPDATED';
};

export type VerificationNorthCapitalEvent = VerificationEvent & {
  kind: 'VerificationNorthCapitalEvent';
  name: 'REQUEST_FAILED';
  reason: string;
};
