import { Registration } from 'Registration/index';
import { AccountStructure } from 'Verification/Domain/ValueObject/AccountStructure';

/**
 * Registration Module ACL
 */
export class RegistrationService {
  public static getClassName = () => 'RegistrationService';
  private registrationModule: Registration.Main;

  constructor(registrationModule: Registration.Main) {
    this.registrationModule = registrationModule;
  }

  async getNorthCapitalAccountStructure(profileId: string, accountId: string) {
    const api = this.registrationModule.api();

    const accountStructure = (await api.getNorthCapitalAccountStructure(profileId, accountId)) as AccountStructure | null;

    if (accountStructure === null) {
      throw new Error(`Account structure not found or not ready, profileId: ${profileId}, accountId: ${accountId}`);
    }

    return accountStructure;
  }
}
