import { UpdateCompanyForVerification, UpdateCompanyForVerificationInput } from 'LegalEntities/UseCases/UpdateCompanyForVerification';
import { UpdateProfileForVerification, UpdateProfileForVerificationInput } from 'LegalEntities/UseCases/UpdateProfileForVerification';

export class UpdateForVerificationController {
  public static getClassName = (): string => 'UpdateForVerificationController';
  private updateProfileForVerificationUseCase: UpdateProfileForVerification;
  private updateCompanyForVerificationUseCase: UpdateCompanyForVerification;

  constructor(updateProfileForVerificationUseCase: UpdateProfileForVerification, updateCompanyForVerificationUseCase: UpdateCompanyForVerification) {
    this.updateProfileForVerificationUseCase = updateProfileForVerificationUseCase;
    this.updateCompanyForVerificationUseCase = updateCompanyForVerificationUseCase;
  }

  public async updateProfileForVerification(input: UpdateProfileForVerificationInput, profileId: string) {
    return this.updateProfileForVerificationUseCase.execute(input, profileId);
  }

  public async updateCompanyForVerification(input: UpdateCompanyForVerificationInput, profileId: string, accountId: string) {
    return this.updateCompanyForVerificationUseCase.execute(input, profileId, accountId);
  }
}
