import { expect } from 'chai';
import { VerificationEventMocks } from 'Reinvest/Verification/test/VerificationEventMocks';
import { VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationStatus } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerificationState, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { CompanyVerifier } from 'Verification/IntegrationLogic/Verifier/CompanyVerifier';

const partyId = 'some-uuid';

const cleanVerifierState = () =>
  <VerificationState>{
    decision: {
      decision: VerificationDecisionType.UNKNOWN,
      onObject: {
        id: 'some-uuid',
        type: VerifierType.COMPANY,
      },
    },
    events: { list: [] },
    id: 'some-uuid',
    ncId: partyId,
    type: VerifierType.COMPANY,
  };

const eventsMockGenerator = new VerificationEventMocks(partyId);
context('Given an investor has synchronized company entity with North Capital and all data is correct', () => {
  describe('When the system verifies the investor AML automatically', async () => {
    it('Then expect SET_KYB_STATUS_TO_PENDING decision to prepare system for manual KYB verification', () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      verifier.handleVerificationEvent(eventsMockGenerator.getAmlEvent(VerificationStatus.APPROVED));
      const result = verifier.makeDecision();

      expect(result.decision).to.be.equal(VerificationDecisionType.SET_KYB_STATUS_TO_PENDING);
    });
  });

  describe('When the manual verfier verifies the investor KYB manually', () => {
    const verifier = new CompanyVerifier(cleanVerifierState());
    eventsMockGenerator.setCompanyVerifierIntoAwaitingManualKYBState(verifier);
    it('Then expect APPROVED decision', async () => {
      verifier.handleVerificationEvent(eventsMockGenerator.getManualResultsEventsSet(VerificationStatus.APPROVED));
      const result = verifier.makeDecision();

      expect(result.decision).to.be.equal(VerificationDecisionType.APPROVED);
    });
  });
});

context('Given an investor has synchronized company entity with North Capital, but is on the AML list', () => {
  describe('When the system verifies the investor AML automatically', async () => {
    it('Then expect ACCOUNT_BANNED decision', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      verifier.handleVerificationEvent(eventsMockGenerator.getAmlEvent(VerificationStatus.DISAPPROVED));
      const result = verifier.makeDecision();

      expect(result.decision).to.be.equal(VerificationDecisionType.ACCOUNT_BANNED);
    });
  });
});

context('Given an investor has synchronized company entity with North Capital, but some data is incorrect', () => {
  describe('When the manual verifier returns KYB is DISAPPROVED', async () => {
    it('Then expect ENTITY_UPDATE_REQUIRED decision', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      eventsMockGenerator.setCompanyVerifierIntoAwaitingManualKYBState(verifier);
      verifier.handleVerificationEvent(eventsMockGenerator.getManualResultsEventsSet(VerificationStatus.DISAPPROVED));
      const result = verifier.makeDecision();
      expect(result.decision).to.be.equal(VerificationDecisionType.ENTITY_UPDATE_REQUIRED);
    });
  });
  describe('When the user updated object to correct data', async () => {
    it('Then it should return APPROVED decision', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      eventsMockGenerator.setCompanyVerifierIntoAwaitingPaidManualKYBState(verifier);
      verifier.handleVerificationEvent(eventsMockGenerator.getManualResultsEventsSet(VerificationStatus.APPROVED));
      const result = verifier.makeDecision();
      expect(result.decision).to.be.equal(VerificationDecisionType.APPROVED);
    });
  });

  describe('When the user updated object and data is still incorrect', async () => {
    it('Then it should return ACCOUNT_BANNED decision', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      eventsMockGenerator.setCompanyVerifierIntoAwaitingPaidManualKYBState(verifier);
      verifier.handleVerificationEvent(eventsMockGenerator.getManualResultsEventsSet(VerificationStatus.DISAPPROVED));
      const result = verifier.makeDecision();
      expect(result.decision).to.be.equal(VerificationDecisionType.ACCOUNT_BANNED);
    });
  });
});

context('Given an investor has synchronized company entity with North Capital, but North Capital is unavailable', () => {
  describe('When the system verifies automatic AML and returns an error', async () => {
    it('Then expect WAIT_FOR_SUPPORT decision', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      verifier.handleVerificationEvent(eventsMockGenerator.getErrorEvent());
      const result = verifier.makeDecision();
      expect(result.decision).to.be.equal(VerificationDecisionType.WAIT_FOR_SUPPORT);
    });
  });

  describe('When the admin fixed an error and recovered verification', async () => {
    it('Then expect REQUEST_AML_VERIFICATION decision', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      verifier.handleVerificationEvent(eventsMockGenerator.getErrorEvent());
      verifier.handleVerificationEvent(eventsMockGenerator.getRecoveryEvent());
      const result = verifier.makeDecision();
      expect(result.decision).to.be.equal(VerificationDecisionType.REQUEST_AML_VERIFICATION);
    });
  });
});

context('Verification resilient tests', () => {
  describe('Set state: REQUEST_AML_VERIFICATION', async () => {
    it('Run all events suite except result events against verifier, but decision should not change', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      const result = verifier.makeDecision();
      expect(result.decision).to.be.equal(VerificationDecisionType.REQUEST_AML_VERIFICATION);
      const events = eventsMockGenerator.allEventsExceptResults();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.REQUEST_AML_VERIFICATION);
    });

    it('Run all events suite with multiple result events against verifier, but decision should change only once to SET_KYB_STATUS_TO_PENDING', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());

      const events = eventsMockGenerator.allEventsExceptKyc();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.SET_KYB_STATUS_TO_PENDING);
    });
  });

  describe('Set state: MANUAL_KYB_REVIEW_REQUIRED', async () => {
    it('Run duplicated result events, but only the first of them should apply', async () => {
      const verifier = new CompanyVerifier(cleanVerifierState());
      eventsMockGenerator.setCompanyVerifierIntoAwaitingManualKYBState(verifier);

      const events = eventsMockGenerator.mixedEventsWithManualKycDisapproved();
      let decision = { decision: VerificationDecisionType.UNKNOWN };

      for (const event of events) {
        verifier.handleVerificationEvent(event);
        decision = verifier.makeDecision();
      }

      expect(decision.decision).to.be.equal(VerificationDecisionType.ENTITY_UPDATE_REQUIRED);
    });
  });

  describe('Testing different results in state: MANUAL_KYB_REVIEW_REQUIRED', async () => {
    const testCases = {
      [VerificationStatus.DISAPPROVED]: VerificationDecisionType.ENTITY_UPDATE_REQUIRED,
      [VerificationStatus.APPROVED]: VerificationDecisionType.APPROVED,
      /** Pending state is initial state, before first manual results.
       * It returns SET_KYB_STATUS_TO_PENDING decision, because there was no VERIFICATION_KYC_SET_TO_PENDING event, so the pending state was not set by the REINVEST platform
       */
      [VerificationStatus.PENDING]: VerificationDecisionType.SET_KYB_STATUS_TO_PENDING,
      [VerificationStatus.NEED_MORE_INFO]: VerificationDecisionType.ENTITY_UPDATE_REQUIRED,
    };

    for (const [verificationStatus, verificationDecision] of Object.entries(testCases)) {
      it(`KYB result with status ${verificationStatus} should return decision ${verificationDecision}`, async () => {
        const verifier = new CompanyVerifier(cleanVerifierState());
        eventsMockGenerator.setCompanyVerifierIntoAwaitingManualKYBState(verifier);
        const initialDecision = verifier.makeDecision();
        expect(initialDecision.decision).to.be.equal(VerificationDecisionType.MANUAL_KYB_REVIEW_REQUIRED);

        verifier.handleVerificationEvent(eventsMockGenerator.getManualResultsEventsSet(verificationStatus as VerificationStatus));

        const result = verifier.makeDecision();
        expect(result.decision).to.be.equal(verificationDecision);
      });
    }
  });

  describe('Testing different results in state: PAID_MANUAL_KYB_REVIEW_REQUIRED', async () => {
    const testCases = {
      [VerificationStatus.DISAPPROVED]: VerificationDecisionType.ACCOUNT_BANNED,
      [VerificationStatus.APPROVED]: VerificationDecisionType.APPROVED,
      [VerificationStatus.PENDING]: VerificationDecisionType.SET_KYB_STATUS_TO_PENDING,
      [VerificationStatus.NEED_MORE_INFO]: VerificationDecisionType.ENTITY_UPDATE_REQUIRED,
    };

    for (const [verificationStatus, verificationDecision] of Object.entries(testCases)) {
      it(`KYB result with status ${verificationStatus} should return decision ${verificationDecision}`, async () => {
        const verifier = new CompanyVerifier(cleanVerifierState());
        eventsMockGenerator.setCompanyVerifierIntoAwaitingPaidManualKYBState(verifier);
        const initialDecision = verifier.makeDecision();
        expect(initialDecision.decision).to.be.equal(VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED);
        verifier.handleVerificationEvent(eventsMockGenerator.getManualResultsEventsSet(verificationStatus as VerificationStatus));

        const result = verifier.makeDecision();
        expect(result.decision).to.be.equal(verificationDecision);
      });
    }
  });
});
