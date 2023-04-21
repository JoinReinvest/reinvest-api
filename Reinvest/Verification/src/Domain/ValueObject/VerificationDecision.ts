export enum ActionName {
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  UPDATE_STAKEHOLDER = 'UPDATE_STAKEHOLDER',
  UPDATE_COMPANY = 'UPDATE_COMPANY',
  BAN_ACCOUNT = 'BAN_ACCOUNT',
  BAN_PROFILE = 'BAN_PROFILE',
  REQUIRE_MANUAL_REVIEW = 'REQUIRE_MANUAL_REVIEW',
}

export enum VerificationDecisionType {
  REQUEST_VERIFICATION = 'REQUEST_VERIFICATION',
  APPROVED = 'APPROVED',
  WAIT_FOR_SUPPORT = 'WAIT_FOR_SUPPORT',
  UPDATE_REQUIRED = 'UPDATE_REQUIRED',
  PROFILE_BANNED = 'PROFILE_BANNED',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',
  MANUAL_REVIEW_REQUIRED = 'MANUAL_REVIEW_REQUIRED',
}

export type VerificationDecision = {
  decision: VerificationDecisionType;
  reasons?: string[];
};

export type VerificationAction = {
  action: ActionName;
  onObjectId: string;
};

export type AccountVerificationDecision = {
  canUserContinueTheInvestment: boolean;
  isAccountVerified: boolean;
  requiredActions: VerificationAction[];
};
