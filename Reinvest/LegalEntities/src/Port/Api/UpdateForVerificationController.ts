import { UpdateProfileForVerification, UpdateProfileForVerificationInput } from 'LegalEntities/UseCases/UpdateProfileForVerification';

export class UpdateForVerificationController {
  public static getClassName = (): string => 'UpdateForVerificationController';
  private updateProfileForVerificationUseCase: UpdateProfileForVerification;

  constructor(updateProfileForVerificationUseCase: UpdateProfileForVerification) {
    this.updateProfileForVerificationUseCase = updateProfileForVerificationUseCase;
  }

  public async updateProfileForVerification(input: UpdateProfileForVerificationInput, profileId: string) {
    return this.updateProfileForVerificationUseCase.execute(input, profileId);
  }
}
