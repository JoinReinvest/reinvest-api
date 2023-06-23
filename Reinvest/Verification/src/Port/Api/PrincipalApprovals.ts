import { UUID } from 'HKEKTypes/Generics';
import { MarkAccountAsApproved } from 'Verification/IntegrationLogic/UseCase/MarkAccountAsApproved';
import { MarkAccountAsDisapproved } from 'Verification/IntegrationLogic/UseCase/MarkAccountAsDisapproved';
import { MarkAccountAsNeedMoreInfo } from 'Verification/IntegrationLogic/UseCase/MarkAccountAsNeedMoreInfo';

export class PrincipalApprovals {
  private markAccountAsApprovedUseCase: MarkAccountAsApproved;
  private markAccountAsDisapprovedUseCase: MarkAccountAsDisapproved;
  private markAccountAsNeedMoreInfoUseCase: MarkAccountAsNeedMoreInfo;

  constructor(
    markAccountAsApprovedUseCase: MarkAccountAsApproved,
    markAccountAsDisapprovedUseCase: MarkAccountAsDisapproved,
    markAccountAsNeedMoreInfoUseCase: MarkAccountAsNeedMoreInfo,
  ) {
    this.markAccountAsApprovedUseCase = markAccountAsApprovedUseCase;
    this.markAccountAsDisapprovedUseCase = markAccountAsDisapprovedUseCase;
    this.markAccountAsNeedMoreInfoUseCase = markAccountAsNeedMoreInfoUseCase;
  }

  static getClassName = () => 'PrincipalApprovals';

  async markAccountAsApproved(profileId: UUID, accountId: UUID): Promise<void> {
    await this.markAccountAsApprovedUseCase.execute(profileId, accountId);
  }

  async markAccountAsDisapproved(profileId: UUID, accountId: UUID, objectIds: string[] = []): Promise<void> {
    await this.markAccountAsDisapprovedUseCase.execute(profileId, accountId, objectIds);
  }

  async markAccountAsNeedMoreInfo(profileId: UUID, accountId: UUID, objectIds: string[] = []): Promise<void> {
    await this.markAccountAsNeedMoreInfoUseCase.execute(profileId, accountId, objectIds);
  }
}
