import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';

export class FulfillBankAccount {
  private bankAccountRepository: BankAccountRepository;

  constructor(bankAccountRepository: BankAccountRepository) {
    this.bankAccountRepository = bankAccountRepository;
  }

  static getClassName = () => 'FulfillBankAccount';

  async execute(profileId: string, bankAccountId: string, plaidResponseObject: any): Promise<void> {
    // find bank account by bankAccountId
    // if plaid response object is already fulfilled, reject the request
    // if plaid response object is not fulfilled, update the bank account record
    // activate bank account and deactivate other bank accounts for the same account
  }
}
