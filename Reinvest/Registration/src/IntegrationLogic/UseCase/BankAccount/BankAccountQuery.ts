import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';

export type CurrentActiveBankAccount = {
  accountNumber: string | null;
  accountType: string | null;
  bankAccountId: string | null;
  bankName: string | null;
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
      bankAccountId: schema.bankAccountId,
      accountNumber: bankAccount.getMaskedAccountNumber(),
      accountType: schema.bankAccountType,
      bankName: bankAccount.getBankName(),
    };
  }

  async getBankAccountMapping(bankAccountId: string): Promise<{
    bankAccountNickName: string | null;
  } | null> {
    const bankAccount = await this.bankAccountRepository.getBankAccount(bankAccountId);

    if (!bankAccount) {
      return null;
    }

    const bankAccountNickName = bankAccount.getNickName();

    return {
      bankAccountNickName,
    };
  }
}
