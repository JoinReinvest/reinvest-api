import { AccountVerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { AccountVerifier } from 'Verification/IntegrationLogic/Verifier/AccountVerifier';

export class VerifyAccount {
  static getClassName = () => 'VerifyAccount';
  private accountVerifier: AccountVerifier;

  constructor(accountVerifier: AccountVerifier) {
    this.accountVerifier = accountVerifier;
  }

  async verify(profileId: string, accountId: string): Promise<AccountVerificationDecision> {
    console.log('verify account id ' + accountId);
    await this.accountVerifier.verifyAccount(profileId, accountId);

    return {
      canUserContinueTheInvestment: true,
      isAccountVerified: true,
      requiredActions: [],
    };
  }
}
