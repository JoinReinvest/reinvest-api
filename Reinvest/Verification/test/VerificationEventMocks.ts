import {
  VerificationAmlResultEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';

export class VerificationEventMocks {
  private amlEvent = (partyId: string, status: VerificationStatus, eventId = 'aml-1', source = 'DIRECT', reasons = []) =>
    <VerificationAmlResultEvent>{
      kind: VerificationEvents.VERIFICATION_AML_RESULT,
      date: new Date(),
      ncId: partyId,
      reasons,
      source,
      status: status,
      eventId,
    };

  private kycEvent = (partyId: string, status: VerificationStatus, eventId = 'kyc-1', source = 'DIRECT', reasons = []) =>
    <VerificationKycResultEvent>{
      kind: VerificationEvents.VERIFICATION_KYC_RESULT,
      date: new Date(),
      ncId: partyId,
      reasons,
      source,
      status: status,
      eventId,
    };
}
