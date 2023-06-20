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

  async markAccountAsDisapproved(accountId: UUID, objectIds: UUID[] = []): Promise<void> {
    // return this.verificationModule.api().markAccountAsDisapproved(accountId, objectIds);
  }

  async markAccountAsApproved(accountId: UUID): Promise<void> {
    // return this.verificationModule.api().markAccountAsApproved(accountId);
  }

  async markAccountAsNeedMoreInfo(accountId: string, objectIds: string[]): Promise<void> {
    // return this.verificationModule.api().markAccountAsNeedMoreInfo(accountId, objectIds);
  }
}
