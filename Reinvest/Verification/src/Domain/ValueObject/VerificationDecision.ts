export enum ActionName {
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  UPDATE_STAKEHOLDER = 'UPDATE_STAKEHOLDER',
  UPDATE_COMPANY = 'UPDATE_COMPANY',
  BAN_ACCOUNT = 'BAN_ACCOUNT',
  BAN_PROFILE = 'BAN_PROFILE',
  REQUIRE_MANUAL_REVIEW = 'REQUIRE_MANUAL_REVIEW',
}

export type VerificationAction = {
  action: ActionName;
  onObjectId: string;
};

export type AccountVerificationDecision = {
  canUserContinueTheInvestment: boolean;
  isAccountVerified: boolean;
  requiredActions: VerificationAction[];
};

export type VerificationDecision = {
  isVerified: boolean;
  requiredActions: VerificationAction[];
};
