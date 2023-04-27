import { VerificationEvents } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

export enum ActionName {
  UPDATE_MEMBER = 'UPDATE_MEMBER',
  UPDATE_MEMBER_AGAIN = 'UPDATE_MEMBER_AGAIN',
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
  SECOND_UPDATE_REQUIRED = 'SECOND_UPDATE_REQUIRED',
  ENTITY_UPDATE_REQUIRED = 'ENTITY_UPDATE_REQUIRED',
  PROFILE_BANNED = 'PROFILE_BANNED',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',
  PAID_MANUAL_KYC_REVIEW_REQUIRED = 'PAID_MANUAL_KYC_REVIEW_REQUIRED',
  MANUAL_KYB_REVIEW_REQUIRED = 'MANUAL_KYB_REVIEW_REQUIRED',
  PAID_MANUAL_KYB_REVIEW_REQUIRED = 'PAID_MANUAL_KYB_REVIEW_REQUIRED',
  SET_KYC_STATUS_TO_PENDING = 'SET_KYC_STATUS_TO_PENDING',
  SET_KYB_STATUS_TO_PENDING = 'SET_KYB_STATUS_TO_PENDING',
}

/**
 * list of events that can be handled by the verifier in the specific decision state
 * it prevents making decisions based on events that are not relevant for the current state
 */
export type AvailableEventsForDecision = {
  [x: string | VerificationDecisionType]: VerificationEvents[];
};

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
