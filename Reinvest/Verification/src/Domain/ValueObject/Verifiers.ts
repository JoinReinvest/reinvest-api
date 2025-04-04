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
  accountId: string | null;
  decision: VerificationDecision;
  events: VerificationEventsList;
  id: string;
  ncId: string;
  type: VerifierType;
};

export interface Verifier {
  canBeUpdated(): boolean;

  getPartyId(): string;

  getVerificationState(): VerificationState;

  handleVerificationEvent(event: VerificationEvent | VerificationEvent[]): void;

  isType(type: VerifierType): boolean;

  makeDecision(): VerificationDecision;
}
