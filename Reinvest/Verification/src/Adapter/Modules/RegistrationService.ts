import { Registration } from 'Registration/index';
import { AccountStructure } from 'Verification/Domain/ValueObject/AccountStructure';

/**
 * Registration Module ACL
 */
export class RegistrationService {
  private registrationModule: Registration.Main;

  constructor(registrationModule: Registration.Main) {
    this.registrationModule = registrationModule;
  }

  public static getClassName = () => 'RegistrationService';

  async immediatelySynchronizeAllAccountStructure(profileId: string, accountId: string): Promise<boolean> {
    return this.registrationModule.api().immediatelySynchronizeAllAccountStructure(profileId, accountId);
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
