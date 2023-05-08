import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { RegistrationDatabase } from 'Registration/Adapter/Database/DatabaseAdapter';
import { BankAccountRepository } from 'Registration/Adapter/Database/Repository/BankAccountRepository';
import { NorthCapitalAdapter } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { PlaidResponse } from 'Registration/Domain/Model/BankAccount';

export class FulfillBankAccount {
  private bankAccountRepository: BankAccountRepository;
  private transactionAdapter: TransactionalAdapter<RegistrationDatabase>;
  private northCapitalAdapter: NorthCapitalAdapter;

  constructor(
    bankAccountRepository: BankAccountRepository,
    transactionAdapter: TransactionalAdapter<RegistrationDatabase>,
    northCapitalAdapter: NorthCapitalAdapter,
  ) {
    this.bankAccountRepository = bankAccountRepository;
    this.transactionAdapter = transactionAdapter;
    this.northCapitalAdapter = northCapitalAdapter;
  }

  static getClassName = () => 'FulfillBankAccount';

  async execute(profileId: string, accountId: string, plaidResponse: PlaidResponse): Promise<void> {
    const bankAccount = await this.bankAccountRepository.findInProgressBankAccount(profileId, accountId);

    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    const plaidResult = await this.northCapitalAdapter.getPlaidAccount(bankAccount.getNorthCapitalId(), plaidResponse);

    const fulfilledCorrectly = bankAccount.fulfill(plaidResult);

    if (!fulfilledCorrectly) {
      throw new Error('Bank account is already fulfilled');
    }

    bankAccount.activate();

    const status = await this.transactionAdapter.transaction(`Activate bank account: ${accountId}`, async () => {
      await this.bankAccountRepository.deactivateBankAccounts(profileId, accountId);
      await this.bankAccountRepository.updateBankAccount(bankAccount);
    });

    if (!status) {
      throw new Error('Bank account fulfillment failed');
    }
  }
}
