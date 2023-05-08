import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { RegistryQueryRepository } from 'Registration/Adapter/Database/Repository/RegistryQueryRepository';
import { NorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { BankAccount, PlaidLink } from 'Registration/Domain/Model/BankAccount';

export class InitializeBankAccount {
  private bankAccountRepository: BankAccountRepository;
  private registryQueryRepository: RegistryQueryRepository;
  private northCapitalAdapter: NorthCapitalAdapter;
  private idGenerator: IdGeneratorInterface;

  constructor(
    bankAccountRepository: BankAccountRepository,
    registryQueryRepository: RegistryQueryRepository,
    northCapitalAdapter: NorthCapitalAdapter,
    idGenerator: IdGeneratorInterface,
  ) {
    this.registryQueryRepository = registryQueryRepository;
    this.bankAccountRepository = bankAccountRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.idGenerator = idGenerator;
  }

  static getClassName = () => 'InitializeBankAccount';

  async execute(profileId: string, accountId: string): Promise<PlaidLink | null> {
    try {
      const activeBankAccount = await this.bankAccountRepository.findActiveBankAccount(profileId, accountId);

      if (activeBankAccount !== null) {
        throw new Error('Bank account already exists');
      }

      const inProgressBankAccount = await this.bankAccountRepository.findInProgressBankAccount(profileId, accountId);

      if (inProgressBankAccount !== null) {
        return inProgressBankAccount.getPlaidLink();
      }

      // find north capital id for the account
      const northCapitalId = await this.registryQueryRepository.findNorthCapitalAccountId(profileId, accountId);

      if (!northCapitalId) {
        // TODO if north capital id not exists, trigger registration process - if it fails, reject the request
        throw new Error('North Capital account not synchronized');
      }

      const bankAccountId = this.idGenerator.createUuid();
      const bankAccount = new BankAccount(bankAccountId, northCapitalId, profileId, accountId);
      const plaidUrl = await this.northCapitalAdapter.getPlaidUrl(northCapitalId);
      bankAccount.setPlaidUrl(plaidUrl);

      await this.bankAccountRepository.createBankAccountRecord(bankAccount);

      return bankAccount.getPlaidLink();
    } catch (error: any) {
      console.error(error);

      return null;
    }
  }
}
