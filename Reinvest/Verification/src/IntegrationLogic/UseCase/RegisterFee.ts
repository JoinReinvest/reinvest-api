import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { VerificationFeesRepository } from 'Verification/Adapter/Database/Repository/VerificationFeesRepository';
import { VerificationDecision, VerificationDecisionType } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationFee } from 'Verification/Domain/VerificationFee';

export class RegisterFee {
  private verificationFeeRepository: VerificationFeesRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(verificationFeeRepository: VerificationFeesRepository, idGenerator: IdGeneratorInterface) {
    this.verificationFeeRepository = verificationFeeRepository;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'RegisterFee';

  async execute(decision: VerificationDecision): Promise<void> {
    const { decisionId, decision: decisionType, onObject } = decision;

    if (![VerificationDecisionType.PAID_MANUAL_KYC_REVIEW_REQUIRED, VerificationDecisionType.PAID_MANUAL_KYB_REVIEW_REQUIRED].includes(decisionType)) {
      return;
    }

    const { type, accountId, profileId } = onObject;
    const fee = VerificationFee.getFeeForType(type);

    if (fee.isZero()) {
      return;
    }

    const id = this.idGenerator.createUuid();

    const verificationFee = VerificationFee.create(id, decisionId, fee, profileId ?? null, accountId ?? null);
    await this.verificationFeeRepository.createVerificationFee(verificationFee);
  }
}
