export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISAPPROVED = 'DISAPPROVED',
  NEED_MORE_INFO = 'NEED_MORE_INFO',
}

export enum VerificationEvents {
  VERIFICATION_KYC_RESULT = 'VerificationKycResult',
  VERIFICATION_AML_RESULT = 'VerificationAmlResult',
  MANUAL_VERIFICATION_KYC_RESULT = 'ManualVerificationKycResult',
  MANUAL_VERIFICATION_AML_RESULT = 'ManualVerificationAmlResult',
  VERIFICATION_RECOVERED_ADMINISTRATIVE = 'VerificationRecoveredAdministrativeEvent',
  VERIFICATION_PROFILE_UNBANNED_ADMINISTRATIVE = 'VerificationProfileUnbannedAdministrativeEvent',
  VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE = 'VerificationAccountUnbannedAdministrativeEvent',
  VERIFICATION_CLEANED_ADMINISTRATIVE = 'VerificationCleanedAdministrativeEvent',
  VERIFICATION_REQUESTED_OBJECT_UPDATED = 'VerificationRequestedObjectUpdatedEvent',
  VERIFICATION_USER_OBJECT_UPDATED = 'VerificationUserObjectUpdatedEvent',
  VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED = 'VerificationNorthCapitalRequestFailedEvent',
  VERIFICATION_KYC_SET_TO_PENDING = 'VerificationKycSetToPendingEvent',
}

export type VerificationEvent = {
  date: Date;
  kind: VerificationEvents;
  ncId: string;
};

export type AutomaticVerificationResultEvent = VerificationEvent & {
  eventId: string;
  reasons: string[];
  source: 'DIRECT' | 'EVENT';
  status: VerificationStatus;
};

export type ManualVerificationResultEvent = VerificationEvent & {
  reasons: string[];
  source: 'DIRECT' | 'EVENT';
  status: VerificationStatus;
};

export type VerificationKycResultEvent = AutomaticVerificationResultEvent & {
  kind: VerificationEvents.VERIFICATION_KYC_RESULT;
};

export type VerificationAmlResultEvent = AutomaticVerificationResultEvent & {
  kind: VerificationEvents.VERIFICATION_AML_RESULT;
};

export type ManualVerificationKycResult = ManualVerificationResultEvent & {
  kind: VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT;
};

export type ManualVerificationAmlResult = ManualVerificationResultEvent & {
  kind: VerificationEvents.MANUAL_VERIFICATION_AML_RESULT;
};

export type VerificationKycSetToPendingEvent = VerificationEvent & {
  kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING;
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
