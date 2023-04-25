import { VerifierRepository } from 'Verification/IntegrationLogic/Verifier/VerifierRepository';

export class AdminVerificationActions {
  static getClassName = () => 'AdminVerificationActions';
  private readonly verifierRepository: VerifierRepository;

  constructor(verifierRepository: VerifierRepository) {
    this.verifierRepository = verifierRepository;
  }

  async recoverVerification(objectId: string): Promise<boolean> {
    const verifier = await this.verifierRepository.findVerifierById(objectId);

    if (!verifier) {
      return false;
    }

    verifier.recover();
    verifier.makeDecision();
    await this.verifierRepository.storeVerifiers([verifier]);

    return true;
  }
}
