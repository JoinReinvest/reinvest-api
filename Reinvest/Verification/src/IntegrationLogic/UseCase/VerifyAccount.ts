export enum ActionName {
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  UPDATE_STAKEHOLDER = 'UPDATE_STAKEHOLDER',
  UPDATE_COMPANY = 'UPDATE_COMPANY',
  BAN_ACCOUNT = 'BAN_ACCOUNT',
  BAN_PROFILE = 'BAN_PROFILE',
}

export type VerificationAction = {
  action: ActionName;
  onObjectId: string;
};
export type VerificationDecision = {
  canUserContinueTheInvestment: boolean;
  isAccountVerified: boolean;
  requiredActions: VerificationAction[];
};

export class VerifyAccount {
  static getClassName = () => 'VerifyAccount';

  async verify(profileId: string, accountId: string): Promise<VerificationDecision> {
    console.log('verify account id ' + accountId);

    return {
      canUserContinueTheInvestment: true,
      isAccountVerified: true,
      requiredActions: [],
    };
  }
}
