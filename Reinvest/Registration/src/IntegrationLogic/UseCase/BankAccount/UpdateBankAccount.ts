import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { RegistryQuery } from 'Registration/Port/Api/RegistryQuery';

export class UpdateBankAccount {
  private bankAccountRepository: BankAccountRepository;
  private registryQuery: RegistryQuery;

  constructor(registryQuery: RegistryQuery, bankAccountRepository: BankAccountRepository) {
    this.registryQuery = registryQuery;
    this.bankAccountRepository = bankAccountRepository;
  }

  static getClassName = () => 'UpdateBankAccount';

  async execute(profileId: string, bankAccountId: string): Promise<void> {
    // find an active bank account for the account
    // create a new bank account record
    // call north capital for new plaid url and store the record
    // return the plaid url and bankAccountId
  }
}
