import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { NorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { BankAccount, PlaidLink } from 'Registration/Domain/Model/BankAccount';

export class UpdateBankAccount {
  private bankAccountRepository: BankAccountRepository;
  private idGenerator: IdGeneratorInterface;
  private northCapitalAdapter: NorthCapitalAdapter;

  constructor(bankAccountRepository: BankAccountRepository, idGenerator: IdGeneratorInterface, northCapitalAdapter: NorthCapitalAdapter) {
    this.bankAccountRepository = bankAccountRepository;
    this.idGenerator = idGenerator;
    this.northCapitalAdapter = northCapitalAdapter;
  }

  static getClassName = () => 'UpdateBankAccount';

  async execute(profileId: string, accountId: string): Promise<PlaidLink | null> {
    try {
      const inProgressBankAccount = await this.bankAccountRepository.findInProgressBankAccount(profileId, accountId);

      if (inProgressBankAccount) {
        return inProgressBankAccount.getPlaidLink();
      }

      // TODO should search any bank account!
      const bankAccount = await this.bankAccountRepository.findActiveBankAccount(profileId, accountId);

      if (!bankAccount) {
        throw new Error('Bank account not found');
      }

      const schema = bankAccount.getObject();

      const updatedBankAccount = BankAccount.create({
        accountId: schema.accountId,
        plaidUrl: null,
        profileId: schema.profileId,
        bankAccountId: this.idGenerator.createUuid(),
        northCapitalId: schema.northCapitalId,
        state: 'IN_PROGRESS',
        bankAccountNumber: null,
        bankAccountType: null,
        plaidResult: null,
      });

      const plaidUrl = await this.northCapitalAdapter.updatePlaidUrl(schema.northCapitalId);
      updatedBankAccount.setPlaidUrl(plaidUrl);

      await this.bankAccountRepository.createBankAccountRecord(updatedBankAccount);

      return updatedBankAccount.getPlaidLink();
    } catch (error: any) {
      console.error(error);

      return null;
    }
  }
}
