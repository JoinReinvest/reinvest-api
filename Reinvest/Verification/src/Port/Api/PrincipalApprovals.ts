import { UUID } from 'HKEKTypes/Generics';
import { MarkAccountAsApproved } from 'Verification/IntegrationLogic/UseCase/MarkAccountAsApproved';

export class PrincipalApprovals {
  private markAccountAsApprovedUseCase: MarkAccountAsApproved;

  constructor(markAccountAsApprovedUseCase: MarkAccountAsApproved) {
    this.markAccountAsApprovedUseCase = markAccountAsApprovedUseCase;
  }

  static getClassName = () => 'PrincipalApprovals';

  async markAccountAsApproved(profileId: UUID, accountId: UUID): Promise<void> {
    await this.markAccountAsApprovedUseCase.execute(profileId, accountId);
    // if (!verifier) {
    //   return false;
    // }
    //
    // const events: VerificationEvent[] = [];
    //
    // if (kycStatus === 'Pending') {

    // } else {
    //   events.push(<ManualVerificationKycResult>{
    //     kind: VerificationEvents.MANUAL_VERIFICATION_KYC_RESULT,
    //     date: new Date(),
    //     ncId: partyId,
    //     reasons: [],
    //     source: 'EVENT',
    //     status: mapVerificationStatus(kycStatus),
    //   });
    //
    //   if (amlStatus) {
    //     events.push(<ManualVerificationAmlResult>{
    //       kind: VerificationEvents.MANUAL_VERIFICATION_AML_RESULT,
    //       date: new Date(),
    //       ncId: partyId,
    //       reasons: [],
    //       source: 'EVENT',
    //       status: mapVerificationStatus(amlStatus),
    //     });
    //   }
    // }
    //
    // verifier.handleVerificationEvent(events);
    //
    // await this.verifierRepository.storeVerifiers([verifier]);
    //
    // return true;
  }

  async markAccountAsDisapproved(profileId: UUID, accountId: UUID, objectIds: string[] = []): Promise<void> {
    return;
  }

  async markAccountAsNeedMoreInfo(profileId: UUID, accountId: UUID, objectIds: string[] = []): Promise<void> {
    return;
  }
}
