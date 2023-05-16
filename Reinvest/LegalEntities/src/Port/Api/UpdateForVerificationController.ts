import { UpdateCompanyForVerification, UpdateCompanyForVerificationInput } from 'LegalEntities/UseCases/UpdateCompanyForVerification';
import { UpdateProfileForVerification, UpdateProfileForVerificationInput } from 'LegalEntities/UseCases/UpdateProfileForVerification';
import { UpdateStakeholderForVerification } from 'LegalEntities/UseCases/UpdateStakeholderForVerification';

export class UpdateForVerificationController {
  public static getClassName = (): string => 'UpdateForVerificationController';
  private updateProfileForVerificationUseCase: UpdateProfileForVerification;
  private updateCompanyForVerificationUseCase: UpdateCompanyForVerification;
  private updateStakeholderForVerificationUseCase: UpdateStakeholderForVerification;

  constructor(
    updateProfileForVerificationUseCase: UpdateProfileForVerification,
    updateCompanyForVerificationUseCase: UpdateCompanyForVerification,
    updateStakeholderForVerification: UpdateStakeholderForVerification,
  ) {
    this.updateProfileForVerificationUseCase = updateProfileForVerificationUseCase;
    this.updateCompanyForVerificationUseCase = updateCompanyForVerificationUseCase;
    this.updateStakeholderForVerificationUseCase = updateStakeholderForVerification;
  }

  public async updateProfileForVerification(input: UpdateProfileForVerificationInput, profileId: string) {
    return this.updateProfileForVerificationUseCase.execute(input, profileId);
  }

  public async updateCompanyForVerification(input: UpdateCompanyForVerificationInput, profileId: string, accountId: string) {
    return this.updateCompanyForVerificationUseCase.execute(input, profileId, accountId);
  }

  public async updateStakeholderForVerification(input: UpdateCompanyForVerificationInput, profileId: string, accountId: string, stakeholderId: string) {
    return this.updateStakeholderForVerificationUseCase.execute(input, profileId, accountId, stakeholderId);
  }
}
