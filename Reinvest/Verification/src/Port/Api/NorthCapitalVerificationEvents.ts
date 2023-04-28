import {
  ManualVerificationAmlResult,
  ManualVerificationKycResult,
  VerificationEvent,
  VerificationEvents,
  VerificationKycSetToPendingEvent,
} from 'Verification/Domain/ValueObject/VerificationEvents';
import { mapVerificationStatus, NorthCapitalVerificationStatuses } from 'Verification/IntegrationLogic/NorthCapitalTypes';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class NorthCapitalVerificationEvents {
  private readonly verifierRepository: VerifierRepository;

  constructor(verifierRepository: VerifierRepository) {
    this.verifierRepository = verifierRepository;
  }

  static getClassName = () => 'NorthCapitalVerificationEvents';

  async handleNorthCapitalVerificationEvent(
    partyId: string,
    kycStatus: NorthCapitalVerificationStatuses,
    amlStatus: NorthCapitalVerificationStatuses | null,
  ): Promise<boolean> {
    const verifier = await this.verifierRepository.findVerifierByPartyId(partyId);

    if (!verifier) {
      return false;
    }

    const events: VerificationEvent[] = [];

    if (kycStatus === 'Pending') {
      events.push(<VerificationKycSetToPendingEvent>{
        date: new Date(),
        kind: VerificationEvents.VERIFICATION_KYC_SET_TO_PENDING,
        ncId: partyId,
      });
    } else {
      events.push(<ManualVerificationKycResult>{
        kind: VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
        date: new Date(),
        ncId: partyId,
        reasons: [],
        source: 'EVENT',
        status: mapVerificationStatus(kycStatus),
      });

      if (amlStatus) {
        events.push(<ManualVerificationAmlResult>{
          kind: VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
          date: new Date(),
          ncId: partyId,
          reasons: [],
          source: 'EVENT',
          status: mapVerificationStatus(amlStatus),
        });
      }
    }

    verifier.handleVerificationEvent(events);

    await this.verifierRepository.storeVerifiers([verifier]);

    return true;
  }
}
