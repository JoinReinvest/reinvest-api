import { DateTime } from 'Money/DateTime';
import {
  ManualVerificationAmlResult,
  ManualVerificationKycResult,
  VerificationAmlResultEvent,
  VerificationEvents,
  VerificationKycResultEvent,
  VerificationStatus,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { Verifier } from 'Verification/Domain/ValueObject/Verifiers';

export class VerificationEventMocks {
  private partyId: string;

  constructor(partyId: string) {
    this.partyId = partyId;
  }

  // except all time events
  public allEventsSet = () => [
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.recoveredAdministrativeEvent(this.partyId),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.northCapitalRequestFailedEvent(this.partyId),
    this.kycSetToPendingEvent(this.partyId),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.accountUnbannedAdministrativeEvent(this.partyId),
    this.manualKycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
  ];

  public mixedEventsWithManualKycDisapproved = () => [
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.recoveredAdministrativeEvent(this.partyId),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
    this.manualKycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
    this.manualKycEvent(this.partyId, VerificationStatus.APPROVED),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.kycEvent(this.partyId, VerificationStatus.APPROVED),
    this.northCapitalRequestFailedEvent(this.partyId),
    this.accountUnbannedAdministrativeEvent(this.partyId),
    this.manualKycEvent(this.partyId, VerificationStatus.APPROVED),
  ];

  public allEventsExceptKyc = () => [
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.recoveredAdministrativeEvent(this.partyId),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.manualAmlEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.amlEvent(this.partyId, VerificationStatus.DISAPPROVED, 2),
    this.accountUnbannedAdministrativeEvent(this.partyId),
  ];

  public allEventsSetExceptRequestedObjectUpdated = () => [
    this.recoveredAdministrativeEvent(this.partyId),
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.northCapitalRequestFailedEvent(this.partyId),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.kycSetToPendingEvent(this.partyId),
    this.manualKycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.accountUnbannedAdministrativeEvent(this.partyId),
  ];

  public allEventsExceptResults = () => [
    this.recoveredAdministrativeEvent(this.partyId),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.kycSetToPendingEvent(this.partyId),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.accountUnbannedAdministrativeEvent(this.partyId),
  ];

  public allEventsSetExceptAutomaticResults = () => [
    this.recoveredAdministrativeEvent(this.partyId),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.kycSetToPendingEvent(this.partyId),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.accountUnbannedAdministrativeEvent(this.partyId),
    this.manualKycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
  ];

  public getAutomaticResultsEventsSet = (eventId = 1, kycStatus = VerificationStatus.DISAPPROVED) => [
    this.kycEvent(this.partyId, kycStatus, eventId),
    this.amlEvent(this.partyId, VerificationStatus.APPROVED, eventId),
  ];

  public getManualResultsEventsSet = (kycStatus: VerificationStatus = VerificationStatus.DISAPPROVED) => [
    this.manualKycEvent(this.partyId, kycStatus),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
  ];

  public getRequestedObjectUpdated = () => [this.requestedObjectUpdatedEvent(this.partyId)];

  public allEventsAndDuplicatedAutomaticResultsEventsSetWithoutRequestedObjectUpdated = () => [
    this.amlEvent(this.partyId, VerificationStatus.APPROVED, 2),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED, 2),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED, 3),
    this.recoveredAdministrativeEvent(this.partyId),
    this.kycSetToPendingEvent(this.partyId),
    this.amlEvent(this.partyId, VerificationStatus.APPROVED, 3),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
    this.amlEvent(this.partyId, VerificationStatus.APPROVED, 4),
    this.manualKycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.accountUnbannedAdministrativeEvent(this.partyId),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED, 4),
  ];

  public allEventsExceptVerificationKycSetToPending = () => [
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.recoveredAdministrativeEvent(this.partyId),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.accountUnbannedAdministrativeEvent(this.partyId),
    this.manualKycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
  ];

  public getKycToPending = () => this.kycSetToPendingEvent(this.partyId);

  public allEventsExceptManualVerificationResults = () => [
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.recoveredAdministrativeEvent(this.partyId),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.kycSetToPendingEvent(this.partyId),
    this.profileUnbannedAdministrativeEvent(this.partyId),
    this.accountUnbannedAdministrativeEvent(this.partyId),
  ];

  public allEventsSetExceptProfileUnbanned = () => [
    this.amlEvent(this.partyId, VerificationStatus.APPROVED),
    this.requestedObjectUpdatedEvent(this.partyId),
    this.recoveredAdministrativeEvent(this.partyId),
    this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED),
    this.northCapitalRequestFailedEvent(this.partyId),
    this.manualAmlEvent(this.partyId, VerificationStatus.APPROVED),
    this.accountUnbannedAdministrativeEvent(this.partyId),
    this.kycSetToPendingEvent(this.partyId),
    this.manualKycEvent(this.partyId, VerificationStatus.DISAPPROVED),
  ];

  public setPartyVerifierStateToPaidManualKYCRequired = (verifier: Verifier) => {
    verifier.handleVerificationEvent([
      this.amlEvent(this.partyId, VerificationStatus.APPROVED, 1),
      this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED, 1),
    ]);
    verifier.handleVerificationEvent([this.requestedObjectUpdatedEvent(this.partyId)]);
    verifier.handleVerificationEvent([
      this.amlEvent(this.partyId, VerificationStatus.APPROVED, 2),
      this.kycEvent(this.partyId, VerificationStatus.DISAPPROVED, 2),
    ]);
    verifier.handleVerificationEvent([this.requestedObjectUpdatedEvent(this.partyId)]);
    verifier.handleVerificationEvent([this.kycSetToPendingEvent(this.partyId)]);
  };

  public setCompanyVerifierIntoAwaitingManualKYBState = (verifier: Verifier) => {
    verifier.handleVerificationEvent(this.getAmlEvent(VerificationStatus.APPROVED));
    verifier.handleVerificationEvent(this.getKycToPending());
  };

  public setCompanyVerifierIntoAwaitingPaidManualKYBState = (verifier: Verifier) => {
    verifier.handleVerificationEvent(this.getAmlEvent(VerificationStatus.APPROVED));
    verifier.handleVerificationEvent(this.getKycToPending());
    verifier.handleVerificationEvent(this.getManualResultsEventsSet(VerificationStatus.DISAPPROVED));
    verifier.handleVerificationEvent(this.getRequestedObjectUpdated());
    verifier.handleVerificationEvent(this.getKycToPending());
  };

  public getAmlEvent = (status: VerificationStatus = VerificationStatus.APPROVED) => this.amlEvent(this.partyId, status);

  getErrorEvent = () => this.northCapitalRequestFailedEvent(this.partyId, ['error']);

  getRecoveryEvent = () => this.recoveredAdministrativeEvent(this.partyId);

  private amlEvent = (partyId: string, status: VerificationStatus, eventId: number = 1, source = 'DIRECT', reasons = []) =>
    <VerificationAmlResultEvent>{
      kind: VerificationEvents.VERIFICATION_AML_RESULT,
      date: DateTime.now().toDate(),
      ncId: partyId,
      reasons,
      source,
      status: status,
      eventId: `aml-${eventId}`,
    };

  private kycEvent = (partyId: string, status: VerificationStatus, eventId: number = 1, source = 'DIRECT', reasons = []) =>
    <VerificationKycResultEvent>{
      kind: VerificationEvents.VERIFICATION_KYC_RESULT,
      date: DateTime.now().toDate(),
      ncId: partyId,
      reasons,
      source,
      status: status,
      eventId: `kyc-${eventId}`,
    };

  private manualKycEvent = (partyId: string, status: VerificationStatus, source = 'DIRECT', reasons = []) =>
    <ManualVerificationKycResult>{
      kind: VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
      date: DateTime.now().toDate(),
      ncId: partyId,
      reasons,
      source,
      status: status,
    };

  private manualAmlEvent = (partyId: string, status: VerificationStatus, source = 'DIRECT', reasons = []) =>
    <ManualVerificationAmlResult>{
      kind: VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
      date: DateTime.now().toDate(),
      ncId: partyId,
      reasons,
      source,
      status: status,
    };

  private recoveredAdministrativeEvent = (partyId: string) => this.event(partyId, VerificationEvents.VERIFICATION_RECOVERED_ADMINISTRATIVE);

  private profileUnbannedAdministrativeEvent = (partyId: string) => this.event(partyId, VerificationEvents.VERIFICATION_PROFILE_UNBANNED_ADMINISTRATIVE);

  private accountUnbannedAdministrativeEvent = (partyId: string) => this.event(partyId, VerificationEvents.VERIFICATION_ACCOUNT_UNBANNED_ADMINISTRATIVE);

  private cleanedAdministrativeEvent = (partyId: string) => this.event(partyId, VerificationEvents.VERIFICATION_CLEANED_ADMINISTRATIVE);

  private requestedObjectUpdatedEvent = (partyId: string) => this.event(partyId, VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED);

  private userObjectUpdatedEvent = (partyId: string) => this.event(partyId, VerificationEvents.VERIFICATION_USER_OBJECT_UPDATED);

  private northCapitalRequestFailedEvent = (partyId: string, reason: string[] = []) => ({
    ...this.event(partyId, VerificationEvents.VERIFICATION_NORTH_CAPITAL_REQUEST_FAILED),
    reason,
  });

  private kycSetToPendingEvent = (partyId: string) => this.event(partyId, VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING);

  private event = (partyId: string, kind: VerificationEvents) => ({
    date: DateTime.now().toDate(),
    kind,
    ncId: partyId,
  });
}
