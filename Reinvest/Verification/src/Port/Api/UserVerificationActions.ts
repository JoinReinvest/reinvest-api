import { VerificationEvents, VerificationRequestedObjectUpdatedEvent } from 'Verification/Domain/ValueObject/VerificationEvents';
import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';
import { DateTime } from 'Money/DateTime';

export class UserVerificationActions {
  static getClassName = () => 'UserVerificationActions';
  private readonly verifierRepository: VerifierRepository;

  constructor(verifierRepository: VerifierRepository) {
    this.verifierRepository = verifierRepository;
  }

  async canObjectBeUpdated(objectId: string): Promise<boolean> {
    const verifier = await this.verifierRepository.findVerifierById(objectId);

    if (!verifier) {
      return false;
    }

    return verifier.canBeUpdated();
  }

  async notifyAboutUpdate(objectId: string): Promise<boolean> {
    const verifier = await this.verifierRepository.findVerifierById(objectId);

    if (!verifier) {
      return false;
    }

    verifier.handleVerificationEvent(<VerificationRequestedObjectUpdatedEvent>{
      kind: VerificationEvents.VERIFICATION_REQUESTED_OBJECT_UPDATED,
      date: DateTime.now().toDate(),
      ncId: verifier.getPartyId(),
    });

    await this.verifierRepository.storeVerifiers([verifier]);

    return true;
  }
}
