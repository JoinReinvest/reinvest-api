import { VerifierRecord } from 'Verification/Adapter/Database/RegistrationSchema';
import { VerificationRepository } from 'Verification/Adapter/Database/Repository/VerificationRepository';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';
import { AccountStructure, IdToNCId } from 'Verification/Domain/ValueObject/AccountStructure';
import { VerificationEventsList, VerificationState, Verifier, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { ProfileVerifier } from 'Verification/IntegrationLogic/Verifier/Verifier';
import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';

export class VerifierFactory {
  static getClassName = () => 'VerifierFactory';
  private northCapitalAdapter: VerificationNorthCapitalAdapter;
  private verificationRepository: VerificationRepository;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter, verificationRepository: VerificationRepository) {
    this.northCapitalAdapter = northCapitalAdapter;
    this.verificationRepository = verificationRepository;
  }

  private async createProfileVerifier(profile: IdToNCId): Promise<ProfileVerifier> {
    const verificationState = await this.findOrInitializeVerificationState(profile.id, profile.ncId, VerifierType.PROFILE);

    return new ProfileVerifier(this.northCapitalAdapter, verificationState);
  }

  private async findOrInitializeVerificationState(id: string, ncId: string, type: VerifierType): Promise<VerificationState> {
    let verifierRecord = await this.verificationRepository.findVerifierRecord(id);

    if (!verifierRecord) {
      verifierRecord = this.verificationRepository.createVerifierRecord(id, ncId, type);
    }

    return this.mapVerifiedRecordToState(verifierRecord);
  }

  async storeVerifiers(verifiers: Verifier[]): Promise<void> {
    const verificationStates: VerificationState[] = [];

    verifiers.forEach(verifier => {
      const verificationState = verifier.getVerificationState();

      verificationStates.push(verificationState);
    });

    await this.verificationRepository.storeVerifierRecords(verificationStates);
  }

  async createVerifiersFromAccountStructure(accountStructure: AccountStructure): Promise<Verifier[]> {
    const verifiers: Verifier[] = [];
    verifiers.push(await this.createProfileVerifier(accountStructure.profile));

    if (accountStructure.type === 'INDIVIDUAL') {
      return verifiers;
    }

    // verifiers.push(this.partyVerifierFactory.createCompanyVerifier(accountStructure.company));

    // if (accountStructure.stakeholders) {
    //   accountStructure.stakeholders.forEach(stakeholder => {
    //     verifiers.push(this.partyVerifierFactory.createStakeholderVerifier(stakeholder));
    //   });
    // }

    return verifiers;
  }

  private mapVerifiedRecordToState(verifierRecord: VerifierRecord): VerificationState {
    return {
      events: verifierRecord.eventsJson as unknown as VerificationEventsList,
      decision: verifierRecord.decisionJson as unknown as VerificationDecision,
      type: verifierRecord.type,
      id: verifierRecord.id,
      ncId: verifierRecord.ncId,
    };
  }
}
