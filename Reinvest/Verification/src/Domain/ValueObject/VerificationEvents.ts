export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISAPPROVED = 'DISAPPROVED',
}

export enum VerificationEvents {
  VERIFICATION_KYC_RESULT = 'VerificationKycResult',
  VERIFICATION_AML_RESULT = 'VerificationAmlResult',
  VERIFICATION_RECOVERED_ADMINISTRATIVE = 'VerificationRecoveredAdministrativeEvent',
  VERIFICATION_PROFILE_UNBANNED_ADMINISTRATIVE = 'VerificationProfileUnbannedAdministrativeEvent',
  VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE = 'VerificationAccountUnbannedAdministrativeEvent',
  VERIFICATION_CLEANED_ADMINISTRATIVE = 'VerificationCleanedAdministrativeEvent',
  VERIFICATION_REQUESTED_OBJECT_UPDATED = 'VerificationRequestedObjectUpdatedEvent',
  VERIFICATION_USER_OBJECT_UPDATED = 'VerificationUserObjectUpdatedEvent',
  VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED = 'VerificationNorthCapitalRequestFailedEvent',
}

export type VerificationEvent = {
  date: Date;
  kind: VerificationEvents;
  ncId: string;
};

export type VerificationResultEvent = VerificationEvent & {
  eventId: string;
  reasons: string[];
  source: 'DIRECT' | 'EVENT';
  status: VerificationStatus;
  verificationWay: 'MANUAL' | 'AUTOMATIC';
};

export type VerificationKycResultEvent = VerificationResultEvent & {
  kind: VerificationEvents.VERIFICATION_KYC_RESULT;
};

export type VerificationAmlResultEvent = VerificationResultEvent & {
  kind: VerificationEvents.VERIFICATION_AML_RESULT;
};

export type VerificationRecoveredAdministrativeEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE;
};

export type VerificationProfileUnbannedAdministrativeEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_PROFILE_UNBANNED_ADMINISTRATIVE;
};

export type VerificationAccountUnbannedAdministrativeEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE;
};

export type VerificationCleanedAdministrativeEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_CLEANED_ADMINISTRATIVE;
};

export type VerificationRequestedObjectUpdatedEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED;
};

export type VerificationUserObjectUpdatedEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED;
};

export type VerificationNorthCapitalObjectFailedEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED;
  reason: string;
};
