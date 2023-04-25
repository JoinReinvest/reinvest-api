import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  VerificationEvent,
  VerificationNorthCapitalEvent,
  VerificationResultEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { ProfileVerifier } from 'Verification/IntegrationLogic/Verifier/ProfileVerifier';

const partyId = 'some-uuid';
const verificationId = 1;

const amlEvent = <VerificationResultEvent>{
  kind: 'VerificationResult',
  date: new Date(),
  ncId: partyId,
  reasons: [],
  source: 'DIRECT',
  status: VerificationStatus.APPROVED,
  type: 'AML',
  eventId: `aml-${verificationId}`,
  verificationWay: 'AUTOMATIC',
};

const kycEvent = <VerificationResultEvent>{
  kind: 'VerificationResult',
  date: new Date(),
  ncId: partyId,
  reasons: [],
  source: 'DIRECT',
  status: VerificationStatus.APPROVED,
  type: 'KYC',
  eventId: `kyc-${verificationId}`,
  verificationWay: 'AUTOMATIC',
};

const errorEvent = <VerificationNorthCapitalEvent>{
  date: new Date(),
  name: 'REQUEST_FAILED',
  kind: 'VerificationNorthCapitalEvent',
  ncId: partyId,
  reason: 'Error reason',
};

const cleanVerifierState = () =>
  <VerificationState>{
    decision: {
      decision: VerificationDecisionType.UNKNOWN,
      onObject: {
        id: 'some-uuid',
        type: VerifierType.PROFILE,
      },
    },
    events: { list: [] },
    id: 'some-uuid',
    ncId: partyId,
    type: VerifierType.PROFILE,
  };

const eventsResolver = (...events: VerificationEvent[]): Promise<VerificationEvent[]> => new Promise(resolve => resolve([...events]));

context('Given an investor has completed profile and synchronized with North Capital and all data is correct', () => {
  describe('When the system verifies the investor profile and returns the AML and KYC are approved', async () => {
    it('Then expect APPROVED decision', async () => {
      const verifier = new ProfileVerifier(cleanVerifierState());
      verifier.handleVerificationEvent(kycEvent);
      verifier.handleVerificationEvent(amlEvent);
      const result = verifier.makeDecision();

      expect(result.decision).to.be.equal(VerificationDecisionType.APPROVED);
    });
  });
});

context('Given an investor has completed profile and synchronized with North Capital, but is on the AML list', () => {
  describe('When the system verifies the investor profile and returns the AML is DISAPPROVED', async () => {
    const verifier = new ProfileVerifier(cleanVerifierState());

    verifier.handleVerificationEvent(kycEvent);
    verifier.handleVerificationEvent(<VerificationResultEvent>{
      ...amlEvent,
      status: VerificationStatus.DISAPPROVED,
    });

    it('Then expect PROFILE_BANNED decision', async () => {
      const result = verifier.makeDecision();

      expect(result.decision).to.be.equal(VerificationDecisionType.PROFILE_BANNED);
    });
  });
});

context('Given an investor has completed profile and synchronized with North Capital, but some data is incorrect', () => {
  describe('When the system verifies the investor profile and returns the KYC is DISAPPROVED', async () => {
    const verifier = new ProfileVerifier(cleanVerifierState());
    verifier.handleVerificationEvent(<VerificationResultEvent>{
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

context('Given an investor has completed profile and synchronized with North Capital, but North Capital is unavailable', () => {
  const verifier = new ProfileVerifier(cleanVerifierState());
  describe('When the system verifies the investor profile and returns an error', async () => {
    verifier.handleVerificationEvent(errorEvent);

    it('Then expect WAIT_FOR_SUPPORT decision', async () => {
      const result = verifier.makeDecision();
      const [reason] = <string[]>result?.reasons;
      expect(result.decision).to.be.equal(VerificationDecisionType.WAIT_FOR_SUPPORT);
      expect(reason).to.be.equal(errorEvent.reason);
    });

    describe('When the admin fixed an error and recovered verification', async () => {
      it('Then expect REQUEST_VERIFICATION decision', async () => {
        verifier.recover();
        const result = verifier.makeDecision();
        expect(result.decision).to.be.equal(VerificationDecisionType.REQUEST_VERIFICATION);
      });
    });
  });
});
