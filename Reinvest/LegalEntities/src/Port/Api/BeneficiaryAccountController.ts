import { UUID } from 'HKEKTypes/Generics';
import { ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { ArchiveBeneficiary } from 'LegalEntities/UseCases/ArchiveBeneficiary';
import { OpenBeneficiary } from 'LegalEntities/UseCases/OpenBeneficiary';

export type CreateBeneficiaryInput = {
  avatar?: {
    id: string;
  };
  name?: {
    firstName: string;
    lastName: string;
  };
};

export class BeneficiaryAccountController {
  private openBeneficiaryUseCase: OpenBeneficiary;
  private archiveBeneficiaryUseCase: ArchiveBeneficiary;

  constructor(openBeneficiaryUseCase: OpenBeneficiary, archiveBeneficiaryUseCase: ArchiveBeneficiary) {
    this.openBeneficiaryUseCase = openBeneficiaryUseCase;
    this.archiveBeneficiaryUseCase = archiveBeneficiaryUseCase;
  }

  public static getClassName = (): string => 'BeneficiaryAccountController';

  public async openBeneficiaryAccount(
    profileId: string,
    individualId: string,
    input: CreateBeneficiaryInput,
  ): Promise<{
    status: boolean;
    accountId?: string;
    errors?: ValidationErrorType[];
  }> {
    const result = await this.openBeneficiaryUseCase.execute(profileId, individualId, input);

    if (result.errors.length > 0) {
      return {
        status: false,
        errors: result.errors,
      };
    }

    return {
      status: true,
      accountId: result.accountId,
    };
  }

  public async archiveBeneficiary(profileId: UUID, accountId: UUID): Promise<boolean> {
    return this.archiveBeneficiaryUseCase.execute(profileId, accountId);
  }
}
