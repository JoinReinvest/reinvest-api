import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';

export enum VerifierType {
  PROFILE = 'PROFILE',
  STAKEHOLDER = 'STAKEHOLDER',
  COMPANY = 'COMPANY',
}

export type VerificationParty = {
  northCapitalId: string;
  objectId: string;
  objectType: 'party' | 'entity';
};

export type VerificationEvent = {
  amlStatus: string;
  kycStatus: string;
  ncId: string;
};

export type VerificationState = {
  aml: any[];
  decisions: any[];
  id: string;
  kyc: any[];
  ncId: string;
  type: VerifierType;
};

export interface Verifier {
  getVerificationState(): VerificationState;

  handleVerificationEvent(event: VerificationEvent): Promise<void>;

  verify(): Promise<VerificationDecision>;
}
