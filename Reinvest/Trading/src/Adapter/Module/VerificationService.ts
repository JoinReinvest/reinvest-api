import { UUID } from "HKEKTypes/Generics";
import { Verification } from "Verification/index";

/**
 * Verification Module ACL
 */
export class VerificationService {
  private verificationModule: Verification.Main;

  constructor(verificationModule: Verification.Main) {
    this.verificationModule = verificationModule;
  }

  static getClassName = () => 'VerificationService';

  async markAccountAsDisapproved(profileId: UUID, accountId: UUID, objectIds: UUID[] = []): Promise<void> {
    return this.verificationModule.api().markAccountAsDisapproved(profileId, accountId, objectIds);
  }

  async markAccountAsApproved(profileId: UUID, accountId: UUID): Promise<void> {
    return this.verificationModule.api().markAccountAsApproved(profileId, accountId);
  }

  async markAccountAsNeedMoreInfo(profileId: UUID, accountId: string, objectIds: string[]): Promise<void> {
    return this.verificationModule.api().markAccountAsNeedMoreInfo(profileId, accountId, objectIds);
  }
}
