import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { BankAccount } from 'Registration/Domain/Model/BankAccount';

export type BankAccountResponse = {
  accountNumber: string | null;
  accountType: string | null;
  bankAccountId: string | null;
  bankAccountStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  bankName: string | null;
};

export class BankAccountQuery {
  private bankAccountRepository: BankAccountRepository;

  constructor(bankAccountRepository: BankAccountRepository) {
    this.bankAccountRepository = bankAccountRepository;
  }

  static getClassName = () => 'BankAccountQuery';

  async readActiveBankAccount(profileId: string, accountId: string): Promise<BankAccountResponse | null> {
    const bankAccount = await this.bankAccountRepository.findActiveBankAccount(profileId, accountId);

    return this.mapBankAccount(bankAccount);
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

  async readBankAccountById(profileId: string, bankAccountId: string): Promise<BankAccountResponse | null> {
    const bankAccount = await this.bankAccountRepository.getBankAccount(bankAccountId);

    return this.mapBankAccount(bankAccount);
  }

  private async mapBankAccount(bankAccount: BankAccount | null): Promise<BankAccountResponse | null> {
    if (!bankAccount) {
      return null;
    }

    const schema = bankAccount.getObject();

    return {
      bankAccountId: schema.bankAccountId,
      accountNumber: bankAccount.getMaskedAccountNumber(),
      accountType: schema.bankAccountType,
      bankName: bankAccount.getBankName(),
      bankAccountStatus: bankAccount.getStatus(),
    };
  }
}
