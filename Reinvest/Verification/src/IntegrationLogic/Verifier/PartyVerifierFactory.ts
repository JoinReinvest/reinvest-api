import { RegistrationService } from 'Verification/Adapter/Modules/RegistrationService';
import { VerificationNorthCapitalAdapter } from 'Verification/Adapter/NorthCapital/VerificationNorthCapitalAdapter';

export class PartyVerifierFactory {
  static getClassName = () => 'PartyVerifierFactory';
  private northCapitalAdapter: VerificationNorthCapitalAdapter;

  constructor(northCapitalAdapter: VerificationNorthCapitalAdapter) {
    this.northCapitalAdapter = northCapitalAdapter;
  }
}
