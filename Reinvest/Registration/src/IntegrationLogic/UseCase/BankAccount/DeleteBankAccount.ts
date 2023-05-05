import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';

export class DeleteBankAccount {
  private bankAccountRepository: BankAccountRepository;

  constructor(bankAccountRepository: BankAccountRepository) {
    this.bankAccountRepository = bankAccountRepository;
  }

  static getClassName = () => 'DeleteBankAccount';

  async execute(profileId: string, bankAccountId: string): Promise<void> {
    // find an active bank account
    // deactivate it
  }
}
