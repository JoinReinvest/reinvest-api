import { Verification } from 'Verification/index';

/**
 * Registration Module ACL
 */
export class RegistrationService {
  public static getClassName = () => 'RegistrationService';
  private verificationModule: Verification.Main;

  constructor(verificationModule: Verification.Main) {
    this.verificationModule = verificationModule;
  }

  // async getProfile(profileId: string): Promise<ProfileForSynchronization | never> {
  //   const api = this.verificationModule.api();
  //
  //   const profile = (await api.getProfileForSynchronization(profileId)) as ProfileForSynchronization | null;
  //
  //   if (profile === null) {
  //     throw new Error(`Profile not found, profileId: ${profileId}`);
  //   }
  //
  //   return profile;
  // }
}
