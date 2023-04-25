import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

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

    verifier.notifyAboutUpdate();
    verifier.makeDecision();
    await this.verifierRepository.storeVerifiers([verifier]);

    return true;
  }
}
