import { expect } from 'chai';
import { VerificationEventMocks } from 'Reinvest/Verification/test/VerificationEventMocks';
import { VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import {
  VerificationAmlResultEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationNorthCapitalObjectFailedEvent,
  VerificationRecoveredAdministrativeEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { ProfileVerifier } from 'Verification/IntegrationLogic/Verifier/ProfileVerifier';

const partyId = 'some-uuid';
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
    verifier.handleVerificationEvent(<VerificationAmlResultEvent>{
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
        verifier.handleVerificationEvent(<VerificationRecoveredAdministrativeEvent>{
          kind: VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE,
          date: new Date(),
          ncId: verifier.getPartyId(),
        });
        const result = verifier.makeDecision();
        expect(result.decision).to.be.equal(VerificationDecisionType.REQUEST_VERIFICATION);
      });
    });
  });
});

context('Verification resilient tests', () => {
  const eventsMocksGenerator = new VerificationEventMocks(partyId);

  describe('Set state: UPDATE_REQUIRED', async () => {
    const verifier = new ProfileVerifier(cleanVerifierState());
    verifier.handleVerificationEvent(eventsMocksGenerator.getAutomaticResultsEventsSet());
    const result = verifier.makeDecision();
    expect(result.decision).to.be.equal(VerificationDecisionType.UPDATE_REQUIRED);

    it('Run all events suite against verifier, but decision should not change', async () => {
      const events = eventsMocksGenerator.allEventsSetExceptRequestedObjectUpdated();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.UPDATE_REQUIRED);
    });
  });

  describe('Set state: REQUEST_VERIFICATION', async () => {
    const verifier = new ProfileVerifier(cleanVerifierState());
    verifier.handleVerificationEvent(eventsMocksGenerator.getAutomaticResultsEventsSet());
    verifier.handleVerificationEvent(eventsMocksGenerator.getRequestedObjectUpdated());
    const result = verifier.makeDecision();
    expect(result.decision).to.be.equal(VerificationDecisionType.REQUEST_VERIFICATION);

    it('Run all events suite against verifier, but decision should not change', async () => {
      const events = eventsMocksGenerator.allEventsSetExceptAutomaticResults();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.REQUEST_VERIFICATION);
    });
    it('Run automatic results events suite against verifier multiple times, but decision should change only once to SECOND_UPDATE_REQUIRED', async () => {
      const events = eventsMocksGenerator.allEventsAndDuplicatedAutomaticResultsEventsSetWithoutRequestedObjectUpdated();
      let decision = verifier.makeDecision();

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.SECOND_UPDATE_REQUIRED);
    });
  });

  describe('Set state: SET_KYC_STATUS_TO_PENDING', async () => {
    const verifier = new ProfileVerifier(cleanVerifierState());
    verifier.handleVerificationEvent(eventsMocksGenerator.getAutomaticResultsEventsSet());
    verifier.handleVerificationEvent(eventsMocksGenerator.getRequestedObjectUpdated());
    verifier.handleVerificationEvent(eventsMocksGenerator.getAutomaticResultsEventsSet(2));
    verifier.handleVerificationEvent(eventsMocksGenerator.getRequestedObjectUpdated());

    const result = verifier.makeDecision();
    expect(result.decision).to.be.equal(VerificationDecisionType.SET_KYC_STATUS_TO_PENDING);

    it('Run all events suite against verifier, but decision should not change', async () => {
      const events = eventsMocksGenerator.allEventsExceptVerificationKycSetToPending();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.SET_KYC_STATUS_TO_PENDING);
    });
    it('Send VERIFICATION_KYC_SET_TO_PENDING, state should change to PAID_MANUAL_KYC_REVIEW_REQUIRED', async () => {
      const event = eventsMocksGenerator.getKycToPending();
      verifier.handleVerificationEvent(event);
      const decision = verifier.makeDecision();

      expect(decision.decision).to.be.equal(VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED);
    });

    it('Run all events suite except manual verification results against verifier again, but decision should not change', async () => {
      const events = eventsMocksGenerator.allEventsExceptManualVerificationResults();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED);
    });

    it('Send KYC disapproved manual result event and profile should be banned', async () => {
      const events = eventsMocksGenerator.getManualResultsEventsSet(VerificationStatus.DISAPPROVED);
      verifier.handleVerificationEvent(events);
      const decision = verifier.makeDecision();

      expect(decision.decision).to.be.equal(VerificationDecisionType.PROFILE_BANNED);
    });

    it('Run all events except profile unbanned and decision should not change', async () => {
      const events = eventsMocksGenerator.allEventsSetExceptProfileUnbanned();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.PROFILE_BANNED);
    });
  });

  describe('Testing different results in state: REQUEST_VERIFICATION', async () => {
    const testCases = {
      [VerificationStatus.DISAPPROVED]: VerificationDecisionType.UPDATE_REQUIRED,
      [VerificationStatus.APPROVED]: VerificationDecisionType.APPROVED,
      [VerificationStatus.PENDING]: VerificationDecisionType.REQUEST_VERIFICATION, // Pending state is initial state, before first automatic results
      [VerificationStatus.NEED_MORE_INFO]: VerificationDecisionType.UPDATE_REQUIRED,
    };

    for (const [verificationStatus, verificationDecision] of Object.entries(testCases)) {
      it(`KYC result with status ${verificationStatus} should return decision ${verificationDecision}`, async () => {
        const verifier = new ProfileVerifier(cleanVerifierState());
        verifier.handleVerificationEvent(eventsMocksGenerator.getAutomaticResultsEventsSet(1, verificationStatus as VerificationStatus));

        const result = verifier.makeDecision();
        expect(result.decision).to.be.equal(verificationDecision);
      });
    }
  });

  describe('Testing different results in state: PAID_MANUAL_KYC_REVIEW_REQUIRED', async () => {
    const testCases = {
      [VerificationStatus.DISAPPROVED]: VerificationDecisionType.PROFILE_BANNED,
      [VerificationStatus.APPROVED]: VerificationDecisionType.APPROVED,
      // [VerificationStatus.PENDING]: "", // this status should never happen. When NC returns Pending for KYC it should be changed to event VERIFICATION_KYC_SET_TO_PENDING
      [VerificationStatus.NEED_MORE_INFO]: VerificationDecisionType.UPDATE_REQUIRED,
    };

    for (const [verificationStatus, verificationDecision] of Object.entries(testCases)) {
      it(`KYC result with status ${verificationStatus} should return decision ${verificationDecision}`, async () => {
        const verifier = new ProfileVerifier(cleanVerifierState());
        eventsMocksGenerator.setPartyVerifierStateToPaidManualKYCRequired(verifier);

        verifier.handleVerificationEvent(eventsMocksGenerator.getManualResultsEventsSet(verificationStatus as VerificationStatus));

        const result = verifier.makeDecision();
        expect(result.decision).to.be.equal(verificationDecision);
      });
    }
  });
});
