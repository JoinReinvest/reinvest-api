import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';

export type VerificationParty = {
  northCapitalId: string;
  objectId: string;
  objectType: 'party' | 'entity';
};

export class PartyVerifier {
  static getClassName = () => 'PartyVerifier';
  private northCapitalAdapter: VerificationNorthCapitalAdapter;
  private verificationParty: VerificationParty;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter, verificationParty: VerificationParty) {
    this.northCapitalAdapter = northCapitalAdapter;
    this.verificationParty = verificationParty;
  }
}
