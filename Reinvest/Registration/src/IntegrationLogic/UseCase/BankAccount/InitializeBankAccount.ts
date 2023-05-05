import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { RegistryQuery } from 'Registration/Port/Api/RegistryQuery';

export class InitializeBankAccount {
  private bankAccountRepository: BankAccountRepository;
  private registryQuery: RegistryQuery;

  constructor(registryQuery: RegistryQuery, bankAccountRepository: BankAccountRepository) {
    this.registryQuery = registryQuery;
    this.bankAccountRepository = bankAccountRepository;
  }

  static getClassName = () => 'InitializeBankAccount';

  async execute(profileId: string, accountId: string): Promise<void> {
    // find if an active bank account exists - if yes reject the request
    // find north capital id for the account
    // if north capital id not exists, trigger registration process - if it fails, reject the request
    // create a new bank account record
    // call north capital for new plaid url and store the record
    // return the plaid url and bankAccountId
  }
}
