import { ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { UpdateProfile, UpdateProfileInput } from 'LegalEntities/UseCases/UpdateProfile';

export class UpdateProfileController {
  public static getClassName = (): string => 'UpdateProfileController';
  private updateProfileUseCase: UpdateProfile;

  constructor(updateProfileUseCase: UpdateProfile) {
    this.updateProfileUseCase = updateProfileUseCase;
  }

  public async updateProfile(input: UpdateProfileInput, profileId: string): Promise<ValidationErrorType[]> {
    return await this.updateProfileUseCase.execute(input, profileId);
  }
}
