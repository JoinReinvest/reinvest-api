import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { ValidationErrorEnum, ValidationErrorType } from 'LegalEntities/Domain/ValueObject/TypeValidators';
import { UpdateCompany, UpdateCompanyAccountInput } from 'LegalEntities/Service/UpdateCompany';
export class UpdateTrustAccount {
  public static getClassName = (): string => 'UpdateTrustAccount';
  private accountRepository: AccountRepository;
  private updateCompany: UpdateCompany;

  constructor(accountRepository: AccountRepository, updateCompany: UpdateCompany) {
    this.accountRepository = accountRepository;
    this.updateCompany = updateCompany;
  }

  public async execute(profileId: string, accountId: string, input: UpdateCompanyAccountInput): Promise<ValidationErrorType[]> {
    const errors: any = [];

    const corporateAccount = await this.accountRepository.findCompanyAccount(profileId, accountId);

    if (!corporateAccount) {
      return errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.NOT_FOUND,
        field: 'companyAccount',
      });
    }

    const { errors: updateErrors, events } = await this.updateCompany.update(corporateAccount, input, profileId);

    await this.accountRepository.updateCompanyAccount(corporateAccount, events);

    return [...errors, ...updateErrors];
  }
}
