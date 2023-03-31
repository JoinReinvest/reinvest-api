import { LegalEntities } from 'LegalEntities/index';
import { IndividualAccountForSynchronization } from 'Registration/Domain/Model/Account';
import { ProfileForSynchronization } from 'Registration/Domain/Model/Profile';

/**
 * Legal Entities Module ACL
 */
export class LegalEntitiesService {
  public static getClassName = () => 'LegalEntitiesService';
  private legalEntitiesModule: LegalEntities.Main;

  constructor(legalEntitiesModule: LegalEntities.Main) {
    this.legalEntitiesModule = legalEntitiesModule;
  }

  async getProfile(profileId: string): Promise<ProfileForSynchronization | never> {
    const api = this.legalEntitiesModule.api();

    const profile = (await api.getProfileForSynchronization(profileId)) as ProfileForSynchronization | null;

    if (profile === null) {
      throw new Error(`Profile not found, profileId: ${profileId}`);
    }

    return profile;
  }

  async getIndividualAccount(profileId: string, accountId: string): Promise<IndividualAccountForSynchronization | never> {
    const api = this.legalEntitiesModule.api();
    const individualAccount = (await api.getIndividualAccountForSynchronization(profileId, accountId)) as IndividualAccountForSynchronization | null;

    if (individualAccount === null) {
      throw new Error(`Individual account not found, profileId: ${profileId}, accountId: ${accountId}`);
    }

    return individualAccount;
  }
}
