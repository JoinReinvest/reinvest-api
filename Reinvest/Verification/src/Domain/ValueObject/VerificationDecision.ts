import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export enum ActionName {
  UPDATE_MEMBER = 'UPDATE_MEMBER',
  BAN_ACCOUNT = 'BAN_ACCOUNT',
  BAN_PROFILE = 'BAN_PROFILE',
  REQUIRE_MANUAL_REVIEW = 'REQUIRE_MANUAL_REVIEW',
  REQUIRE_ADMIN_SUPPORT = 'REQUIRE_ADMIN_SUPPORT',
}

export enum VerificationDecisionType {
  UNKNOWN = 'UNKNOWN',
  REQUEST_VERIFICATION = 'REQUEST_VERIFICATION',
  REQUEST_AML_VERIFICATION = 'REQUEST_AML_VERIFICATION',
  APPROVED = 'APPROVED',
  WAIT_FOR_SUPPORT = 'WAIT_FOR_SUPPORT',
  UPDATE_REQUIRED = 'UPDATE_REQUIRED',
  ENTITY_UPDATE_REQUIRED = 'ENTITY_UPDATE_REQUIRED',
  PROFILE_BANNED = 'PROFILE_BANNED',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',
  PAID_MANUAL_KYC_REVIEW_REQUIRED = 'PAID_MANUAL_KYC_REVIEW_REQUIRED',
  MANUAL_KYB_REVIEW_REQUIRED = 'MANUAL_KYB_REVIEW_REQUIRED',
  PAID_MANUAL_KYB_REVIEW_REQUIRED = 'PAID_MANUAL_KYB_REVIEW_REQUIRED',
}

export type VerificationObject = {
  type: VerifierType;
  accountId?: string;
  profileId?: string;
  stakeholderId?: string;
};

export type VerificationDecision = {
  decision: VerificationDecisionType;
  onObject: VerificationObject;
  reasons?: string[];
};

export type VerificationAction = {
  action: ActionName;
  onObject: VerificationObject;
  reasons?: string[];
};

export type AccountVerificationDecision = {
  canUserContinueTheInvestment: boolean;
  isAccountVerified: boolean;
  requiredActions: VerificationAction[];
};
