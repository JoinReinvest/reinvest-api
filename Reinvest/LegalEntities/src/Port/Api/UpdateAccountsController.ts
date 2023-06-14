import { ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import type { UpdateCompanyAccountInput } from 'LegalEntities/UseCases/abstract/UpdateCompany';
import { UpdateBeneficiaryAccount, UpdateBeneficiaryAccountInput } from 'LegalEntities/UseCases/UpdateBeneficiaryAccount';
import { UpdateCorporateAccount } from 'LegalEntities/UseCases/UpdateCorporateAccount';
import { UpdateIndividualAccount, UpdateIndividualAccountInput } from 'LegalEntities/UseCases/UpdateIndividualAccount';
import { UpdateTrustAccount } from 'LegalEntities/UseCases/UpdateTrustAccount';

export class UpdateAccountsController {
  public static getClassName = (): string => 'UpdateAccountsController';
  private updateIndividualAccountUseCase: UpdateIndividualAccount;
  private updateCorporateAccountUseCase: UpdateCorporateAccount;
  private updateTrustAccountUseCase: UpdateTrustAccount;
  private updateBeneficiaryAccountUseCase: UpdateBeneficiaryAccount;

  constructor(
    updateIndividualAccountUseCase: UpdateIndividualAccount,
    updateCorporateAccountUseCase: UpdateCorporateAccount,
    updateTrustAccountUseCase: UpdateTrustAccount,
    updateBeneficiaryAccountUseCase: UpdateBeneficiaryAccount,
  ) {
    this.updateIndividualAccountUseCase = updateIndividualAccountUseCase;
    this.updateCorporateAccountUseCase = updateCorporateAccountUseCase;
    this.updateTrustAccountUseCase = updateTrustAccountUseCase;
    this.updateBeneficiaryAccountUseCase = updateBeneficiaryAccountUseCase;
  }

  public async updateIndividualAccount(profileId: string, accountId: string, input: UpdateIndividualAccountInput): Promise<ValidationErrorType[]> {
    return await this.updateIndividualAccountUseCase.execute(profileId, accountId, input);
  }

  public async updateCorporateAccount(profileId: string, accountId: string, input: UpdateCompanyAccountInput): Promise<ValidationErrorType[]> {
    return await this.updateCorporateAccountUseCase.execute(profileId, accountId, input);
  }

  public async updateTrustAccount(profileId: string, accountId: string, input: UpdateCompanyAccountInput): Promise<ValidationErrorType[]> {
    return await this.updateTrustAccountUseCase.execute(profileId, accountId, input);
  }

  public async updateBeneficiaryAccount(profileId: string, accountId: string, input: UpdateBeneficiaryAccountInput): Promise<ValidationErrorType[]> {
    return await this.updateBeneficiaryAccountUseCase.execute(profileId, accountId, input);
  }
}
