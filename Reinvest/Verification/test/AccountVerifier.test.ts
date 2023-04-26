import { expect } from 'chai';
import { ActionName, VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { AccountVerifier } from 'Verification/IntegrationLogic/Verifier/AccountVerifier';

const profileObject = {
  id: 'some-profile-uuid',
  type: VerifierType.PROFILE,
};

context('Given an investor has completed onboarding and synchronized all account members with North Capital and all data is correct', () => {
  describe('When the system verifies the investor account and returns the AML and KYC are approved for all members', async () => {
    const verifiersDecisions: VerificationDecision[] = [
      <VerificationDecision>{
        decision: VerificationDecisionType.APPROVED,
        onObject: profileObject,
      },
    ];
    it('Then expect APPROVED decision', async () => {
      const accountVerifier = new AccountVerifier('some-profile-uuid', 'some-account-uuid');
      const result = await accountVerifier.makeAccountVerificationDecision(verifiersDecisions);

      expect(result.canUserContinueTheInvestment).to.be.true;
      expect(result.isAccountVerified).to.be.true;
      expect(result.requiredActions).to.be.empty;
    });
  });
});

context('Given an investor has completed onboarding and synchronized all account members with North Capital and some data is incorrect', () => {
  describe('When the system verifies the investor account and returns the KYC is not approved for a member', async () => {
    const verifiersDecisions: VerificationDecision[] = [
      <VerificationDecision>{
        decision: VerificationDecisionType.UPDATE_REQUIRED,
        onObject: profileObject,
        reasons: ['Incorrect address', 'Incorrect zip code'],
      },
    ];
    it('Then expect "require update" action', async () => {
      const accountVerifier = new AccountVerifier('some-profile-uuid', 'some-account-uuid');
      const result = await accountVerifier.makeAccountVerificationDecision(verifiersDecisions);

      expect(result.canUserContinueTheInvestment).to.be.false;
      expect(result.isAccountVerified).to.be.false;
      expect(result.requiredActions).length(1);
      const [action] = result.requiredActions;
      expect(action?.action).to.be.equal(ActionName.UPDATE_MEMBER);
    });
  });
});

context('Given an investor has completed onboarding and synchronized all account members with North Capital, but profile is on AML list', () => {
  describe('When the system verifies the investor account and returns the AML failed for profile', async () => {
    const verifiersDecisions: VerificationDecision[] = [
      <VerificationDecision>{
        decision: VerificationDecisionType.PROFILE_BANNED,
        onObject: profileObject,
        reasons: ['AML verification failed'],
      },
    ];
    it('Then expect "ban profile" action', async () => {
      const accountVerifier = new AccountVerifier('some-profile-uuid', 'some-account-uuid');
      const result = await accountVerifier.makeAccountVerificationDecision(verifiersDecisions);

      expect(result.canUserContinueTheInvestment).to.be.false;
      expect(result.isAccountVerified).to.be.false;
      expect(result.requiredActions).length(1);
      const [action] = result.requiredActions;
      expect(action?.action).to.be.equal(ActionName.BAN_PROFILE);
    });
  });
});
