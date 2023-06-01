import { VerifierRecord } from 'Verification/Adapter/Database/RegistrationSchema';
import { VerificationAdapter } from 'Verification/Adapter/Database/Repository/VerificationAdapter';
import { AccountStructure, IdToNCId } from 'Verification/Domain/ValueObject/AccountStructure';
import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEventsList, VerificationState, Verifier, VerifierType } from 'Verification/Domain/ValueObject/Verifiers';
import { CompanyVerifier } from 'Verification/IntegrationLogic/Verifier/CompanyVerifier';
import { ProfileVerifier } from 'Verification/IntegrationLogic/Verifier/ProfileVerifier';
import { StakeholderVerifier } from 'Verification/IntegrationLogic/Verifier/StakeholderVerifier';

export class VerifierRepository {
  private verificationAdapter: VerificationAdapter;

  constructor(verificationAdapter: VerificationAdapter) {
    this.verificationAdapter = verificationAdapter;
  }

  static getClassName = () => 'VerifierRepository';

  async storeVerifiers(verifiers: Verifier[]): Promise<void> {
    const verificationStates: VerificationState[] = [];

    verifiers.forEach((verifier: Verifier) => {
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

  async findVerifierById(objectId: string): Promise<Verifier | null> {
    const verifierRecord = await this.verificationAdapter.findVerifierRecord(objectId);

    if (!verifierRecord) {
      return null;
    }

    return this.mapRecordToVerifier(verifierRecord);
  }

  async findVerifierByPartyId(partyId: string) {
    const verifierRecord = await this.verificationAdapter.findVerifierRecordByPartyId(partyId);

    if (!verifierRecord) {
      return null;
    }

    return this.mapRecordToVerifier(verifierRecord);
  }

  private async createProfileVerifier(profile: IdToNCId): Promise<ProfileVerifier> {
    const verificationState = await this.findOrInitializeVerificationState(profile.id, profile.ncId, VerifierType.PROFILE);

    return new ProfileVerifier(verificationState);
  }

  private async findOrInitializeVerificationState(id: string, ncId: string, type: VerifierType, accountId: string | null = null): Promise<VerificationState> {
    let verifierRecord = await this.verificationAdapter.findVerifierRecord(id);

    if (!verifierRecord) {
      verifierRecord = this.verificationAdapter.createVerifierRecord(id, ncId, type, accountId);
    }

    return this.mapVerifiedRecordToState(verifierRecord);
  }

  private mapVerifiedRecordToState(verifierRecord: VerifierRecord): VerificationState {
    return {
      accountId: verifierRecord.accountId,
      events: verifierRecord.eventsJson as unknown as VerificationEventsList,
      decision: verifierRecord.decisionJson as unknown as VerificationDecision,
      type: verifierRecord.type,
      id: verifierRecord.id,
      ncId: verifierRecord.ncId,
    };
  }

  private async createStakeholderVerifier(stakeholder: IdToNCId, account: IdToNCId): Promise<StakeholderVerifier> {
    const verificationState = await this.findOrInitializeVerificationState(stakeholder.id, stakeholder.ncId, VerifierType.STAKEHOLDER, account.id);

    return new StakeholderVerifier(verificationState);
  }

  private async createCompanyVerifier(company: IdToNCId): Promise<CompanyVerifier> {
    const verificationState = await this.findOrInitializeVerificationState(company.id, company.ncId, VerifierType.COMPANY);

    return new CompanyVerifier(verificationState);
  }

  private mapRecordToVerifier(verifierRecord: VerifierRecord): Verifier | null {
    const state = this.mapVerifiedRecordToState(verifierRecord);
    switch (state.type) {
      case VerifierType.PROFILE:
        return new ProfileVerifier(state);
      case VerifierType.STAKEHOLDER:
        return new StakeholderVerifier(state);
      case VerifierType.COMPANY:
        return new CompanyVerifier(state);
      default:
        return null;
    }
  }
}
