import { VerificationDecision } from 'Verification/Domain/ValueObject/VerificationDecision';
import { VerificationEvent } from 'Verification/Domain/ValueObject/VerificationEvents';

export enum VerifierType {
  PROFILE = 'PROFILE',
  STAKEHOLDER = 'STAKEHOLDER',
  COMPANY = 'COMPANY',
}

export type VerificationEventsList = {
  list: VerificationEvent[];
};

export type VerificationState = {
  decision: VerificationDecision;
  events: VerificationEventsList;
  id: string;
  ncId: string;
  type: VerifierType;
};

export interface Verifier {
  getVerificationState(): VerificationState;

  handleVerificationEvent(event: VerificationEvent): void;

  makeDecision(): VerificationDecision;

  recover(): void;

  verify(): Promise<VerificationDecision>;
}
