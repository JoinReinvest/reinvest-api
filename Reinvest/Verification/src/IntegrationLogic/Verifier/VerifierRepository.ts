import { VerifierRecord } from 'Verification/Adapter/Database/RegistrationSchema';
import { VerificationAdapter } from 'Verification/Adapter/Database/Repository/VerificationAdapter';
import { AccountStructure, IdToNCId } from 'Verification/Domain/ValueObject/AccountStructure';
import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEventsList, VerificationState, Verifier, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { CompanyVerifier } from 'Verification/IntegrationLogic/Verifier/CompanyVerifier';
import { ProfileVerifier } from 'Verification/IntegrationLogic/Verifier/ProfileVerifier';
import { StakeholderVerifier } from 'Verification/IntegrationLogic/Verifier/StakeholderVerifier';

export class VerifierRepository {
  static getClassName = () => 'VerifierRepository';
  private verificationAdapter: VerificationAdapter;

  constructor(verificationAdapter: VerificationAdapter) {
    this.verificationAdapter = verificationAdapter;
  }

  private async createProfileVerifier(profile: IdToNCId): Promise<ProfileVerifier> {
    const verificationState = await this.findOrInitializeVerificationState(profile.id, profile.ncId, VerifierType.PROFILE);

    return new ProfileVerifier(verificationState);
  }

  private async findOrInitializeVerificationState(id: string, ncId: string, type: VerifierType): Promise<VerificationState> {
    let verifierRecord = await this.verificationAdapter.findVerifierRecord(id);

    if (!verifierRecord) {
      verifierRecord = this.verificationAdapter.createVerifierRecord(id, ncId, type);
    }

    return this.mapVerifiedRecordToState(verifierRecord);
  }

  async storeVerifiers(verifiers: Verifier[]): Promise<void> {
    const verificationStates: VerificationState[] = [];

    verifiers.forEach(verifier => {
      const verificationState = verifier.getVerificationState();

      verificationStates.push(verificationState);
    });

    await this.verificationAdapter.storeVerifierRecords(verificationStates);
  }

  async createVerifiersFromAccountStructure(accountStructure: AccountStructure): Promise<Verifier[]> {
    const verifiers: Verifier[] = [];
    verifiers.push(await this.createProfileVerifier(accountStructure.profile));

    if (accountStructure.type === 'INDIVIDUAL') {
      return verifiers;
    }

    if (accountStructure.type === 'COMPANY') {
      verifiers.push(await this.createCompanyVerifier(<IdToNCId>accountStructure.company));

      if (accountStructure?.stakeholders && accountStructure.stakeholders.length > 0) {
        for (const stakeholder of accountStructure.stakeholders) {
          verifiers.push(await this.createStakeholderVerifier(stakeholder, accountStructure.account));
        }
      }

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

  private async createStakeholderVerifier(stakeholder: IdToNCId, account: IdToNCId): Promise<StakeholderVerifier> {
    const verificationState = await this.findOrInitializeVerificationState(stakeholder.id, stakeholder.ncId, VerifierType.STAKEHOLDER);

    return new StakeholderVerifier(verificationState, account.id);
  }

  private async createCompanyVerifier(company: IdToNCId): Promise<CompanyVerifier> {
    const verificationState = await this.findOrInitializeVerificationState(company.id, company.ncId, VerifierType.COMPANY);

    return new CompanyVerifier(verificationState);
  }

  async findVerifierById(objectId: string): Promise<Verifier | null> {
    const verifierRecord = await this.verificationAdapter.findVerifierRecord(objectId);

    if (!verifierRecord) {
      return null;
    }

    const state = this.mapVerifiedRecordToState(verifierRecord);
    switch (state.type) {
      case VerifierType.PROFILE:
        return new ProfileVerifier(state);
      case VerifierType.STAKEHOLDER:
        return new StakeholderVerifier(state, ''); // todo include account id into state
      case VerifierType.COMPANY:
        return new CompanyVerifier(state);
      default:
        return null;
    }
  }
}
