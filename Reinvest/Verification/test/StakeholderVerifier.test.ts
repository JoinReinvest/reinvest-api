import { expect } from 'chai';
import { VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  VerificationAmlResultEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationNorthCapitalObjectFailedEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { StakeholderVerifier } from 'Verification/IntegrationLogic/Verifier/StakeholderVerifier';

const partyId = 'some-uuid';
const accountId = 'some-account-uuid';
const verificationId = 1;

const amlEvent = <VerificationAmlResultEvent>{
  kind: VerificationEvents.VERIFICATION_AML_RESULT,
  date: new Date(),
  ncId: partyId,
  reasons: [],
  source: 'DIRECT',
  status: VerificationStatus.APPROVED,
  eventId: `aml-${verificationId}`,
};

const kycEvent = <VerificationKycResultEvent>{
  kind: VerificationEvents.VERIFICATION_KYC_RESULT,
  date: new Date(),
  ncId: partyId,
  reasons: [],
  source: 'DIRECT',
  status: VerificationStatus.APPROVED,
  eventId: `kyc-${verificationId}`,
};

const errorEvent = <VerificationNorthCapitalObjectFailedEvent>{
  date: new Date(),
  kind: VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED,
  ncId: partyId,
  reason: 'Error reason',
};

const cleanVerifierState = () =>
  <VerificationState>{
    accountId,
    decision: {
      decision: VerificationDecisionType.UNKNOWN,
      onObject: {
        id: 'some-uuid',
        type: VerifierType.STAKEHOLDER,
      },
    },
    events: { list: [] },
    id: 'some-uuid',
    ncId: partyId,
    type: VerifierType.STAKEHOLDER,
  };

context('Given an investor has completed account and synchronized with North Capital and all data is correct', () => {
  describe('When the system verifies the investor  and returns the AML and KYC are approved', async () => {
    it('Then expect APPROVED decision', async () => {
      const verifier = new StakeholderVerifier(cleanVerifierState());
      verifier.handleVerificationEvent(kycEvent);
      verifier.handleVerificationEvent(amlEvent);
      const result = verifier.makeDecision();

      expect(result.decision).to.be.equal(VerificationDecisionType.APPROVED);
    });
  });
});

context('Given an investor has completed account and synchronized with North Capital, but is on the AML list', () => {
  describe('When the system verifies the investor stakeholder and returns the AML is DISAPPROVED', async () => {
    const verifier = new StakeholderVerifier(cleanVerifierState());

    verifier.handleVerificationEvent(kycEvent);
    verifier.handleVerificationEvent(<VerificationAmlResultEvent>{
      ...amlEvent,
      status: VerificationStatus.DISAPPROVED,
    });

    it('Then expect ACCOUNT_BANNED decision', async () => {
      const result = verifier.makeDecision();

      expect(result.decision).to.be.equal(VerificationDecisionType.ACCOUNT_BANNED);
    });
  });
});

context('Given an investor has completed account and synchronized with North Capital, but some data is incorrect', () => {
  describe('When the system verifies the investor stakeholder and returns the KYC is DISAPPROVED', async () => {
    const verifier = new StakeholderVerifier(cleanVerifierState());

    verifier.handleVerificationEvent(<VerificationKycResultEvent>{
      ...kycEvent,
      status: VerificationStatus.DISAPPROVED,
      reasons: ['Some reason'],
    });
    verifier.handleVerificationEvent(amlEvent);

    it('Then expect UPDATE_REQUIRED decision', async () => {
      const result = verifier.makeDecision();
      const [reason] = <string[]>result?.reasons;
      expect(result.decision).to.be.equal(VerificationDecisionType.UPDATE_REQUIRED);
      expect(reason).to.be.equal('Some reason');
    });
  });
});

context('Given an investor has completed account and synchronized with North Capital, but North Capital is unavailable', () => {
  describe('When the system verifies the investor stakeholder and returns an error', async () => {
    const verifier = new StakeholderVerifier(cleanVerifierState());

    verifier.handleVerificationEvent(errorEvent);
    it('Then expect WAIT_FOR_SUPPORT decision', async () => {
      const result = verifier.makeDecision();
      const [reason] = <string[]>result?.reasons;
      expect(result.decision).to.be.equal(VerificationDecisionType.WAIT_FOR_SUPPORT);
      expect(reason).to.be.equal(errorEvent.reason);
    });
  });
});
