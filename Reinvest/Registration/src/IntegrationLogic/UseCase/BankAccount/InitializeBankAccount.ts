import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { RegistryQueryRepository } from 'Registration/Adapter/Database/Repository/RegistryQueryRepository';
import { NorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { BankAccount, PlaidLink } from 'Registration/Domain/Model/BankAccount';
import { ImmediateSynchronize } from 'Registration/IntegrationLogic/UseCase/ImmediateSynchronize';

export class InitializeBankAccount {
  private bankAccountRepository: BankAccountRepository;
  private registryQueryRepository: RegistryQueryRepository;
  private northCapitalAdapter: NorthCapitalAdapter;
  private idGenerator: IdGeneratorInterface;
  private immediateSynchronizeUseCase: ImmediateSynchronize;

  constructor(
    bankAccountRepository: BankAccountRepository,
    registryQueryRepository: RegistryQueryRepository,
    northCapitalAdapter: NorthCapitalAdapter,
    idGenerator: IdGeneratorInterface,
    immediateSynchronizeUseCase: ImmediateSynchronize,
  ) {
    this.registryQueryRepository = registryQueryRepository;
    this.bankAccountRepository = bankAccountRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.idGenerator = idGenerator;
    this.immediateSynchronizeUseCase = immediateSynchronizeUseCase;
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
      let northCapitalId = await this.registryQueryRepository.findNorthCapitalAccountId(profileId, accountId);

      if (!northCapitalId) {
        // TODO still something not work here
        await this.immediateSynchronizeUseCase.immediatelySynchronizeAccount(profileId, accountId);
        northCapitalId = await this.registryQueryRepository.findNorthCapitalAccountId(profileId, accountId);


        if (!northCapitalId) {
          throw new Error('North Capital account not synchronized');
        }
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
