import { ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { UpdateIndividualAccount, UpdateIndividualAccountInput } from 'LegalEntities/UseCases/UpdateIndividualAccount';

export class UpdateAccountsController {
  public static getClassName = (): string => 'UpdateAccountsController';
  private updateIndividualAccountUseCase: UpdateIndividualAccount;

  constructor(updateIndividualAccountUseCase: UpdateIndividualAccount) {
    this.updateIndividualAccountUseCase = updateIndividualAccountUseCase;
  }

  public async updateIndividualAccount(profileId: string, accountId: string, input: UpdateIndividualAccountInput): Promise<ValidationErrorType[]> {
    return await this.updateIndividualAccountUseCase.execute(profileId, accountId, input);
  }
}
