import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';

export type CurrentActiveBankAccount = {
  accountNumber: string | null;
  accountType: string | null;
};

export class BankAccountQuery {
  private bankAccountRepository: BankAccountRepository;

  constructor(bankAccountRepository: BankAccountRepository) {
    this.bankAccountRepository = bankAccountRepository;
  }

  static getClassName = () => 'BankAccountQuery';

  async readActiveBankAccount(profileId: string, accountId: string): Promise<CurrentActiveBankAccount | null> {
    const bankAccount = await this.bankAccountRepository.findActiveBankAccount(profileId, accountId);

    if (!bankAccount) {
      return null;
    }

    const schema = bankAccount.getObject();

    return {
      accountNumber: bankAccount.getMaskedAccountNumber(),
      accountType: schema.bankAccountType,
    };
  }
}
