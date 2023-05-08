import { JSONObjectOf } from 'HKEKTypes/Generics';
import { registrationBankAccountTable, RegistrationDatabaseAdapterProvider } from 'Registration/Adapter/Database/DatabaseAdapter';
import { RegistrationBankAccountTable } from 'Registration/Adapter/Database/RegistrationSchema';
import { BankAccount, PlaidResult } from 'Registration/Domain/Model/BankAccount';

export class BankAccountRepository {
  private databaseAdapterProvider: RegistrationDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: RegistrationDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'BankAccountRepository';

  async createBankAccountRecord(bankAccount: BankAccount): Promise<void> {
    const record = this.bankAccountToBankAccountRecord(bankAccount);
    await this.databaseAdapterProvider.provide().insertInto(registrationBankAccountTable).values(record).execute();
  }

  async updateBankAccount(bankAccount: BankAccount): Promise<void> {
    try {
      const record = this.bankAccountToBankAccountRecord(bankAccount);
      const toUpdate = {
        bankAccountNumber: record.bankAccountNumber,
        bankAccountType: record.bankAccountType,
        plaidJson: record.plaidJson,
        state: record.state,
      };

      await this.databaseAdapterProvider
        .provide()
        .updateTable(registrationBankAccountTable)
        .set(toUpdate)
        .where('profileId', '=', record.profileId)
        .where('bankAccountId', '=', record.bankAccountId)
        .execute();
    } catch (error: any) {
      console.error(error);
    }
  }

  async findActiveBankAccount(profileId: string, accountId: string): Promise<BankAccount | null> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationBankAccountTable)
        .select(['accountId', 'bankAccountId', 'northCapitalId', 'profileId', 'plaidUrl', 'plaidJson', 'bankAccountNumber', 'bankAccountType', 'state'])
        .where('profileId', '=', profileId)
        .where('accountId', '=', accountId)
        .where('state', '=', 'ACTIVE')
        .limit(1)
        .executeTakeFirstOrThrow();

      return this.bankAccountRecordToBankAccount(data);
    } catch (error: any) {
      return null;
    }
  }

  async findInProgressBankAccount(profileId: string, accountId: string): Promise<BankAccount | null> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationBankAccountTable)
        .select(['accountId', 'bankAccountId', 'northCapitalId', 'profileId', 'plaidUrl', 'plaidJson', 'bankAccountNumber', 'bankAccountType', 'state'])
        .where('profileId', '=', profileId)
        .where('accountId', '=', accountId)
        .where('state', '=', 'IN_PROGRESS')
        .limit(1)
        .executeTakeFirstOrThrow();

      return this.bankAccountRecordToBankAccount(data);
    } catch (error: any) {
      return null;
    }
  }

  async findBankAccountById(profileId: string, bankAccountId: string): Promise<BankAccount | null> {
    try {
      const data = await this.databaseAdapterProvider
        .provide()
        .selectFrom(registrationBankAccountTable)
        .select(['accountId', 'bankAccountId', 'northCapitalId', 'profileId', 'plaidUrl', 'plaidJson', 'bankAccountNumber', 'bankAccountType', 'state'])
        .where('profileId', '=', profileId)
        .where('bankAccountId', '=', bankAccountId)
        .where('state', '=', 'IN_PROGRESS')
        .limit(1)
        .executeTakeFirstOrThrow();

      return this.bankAccountRecordToBankAccount(data);
    } catch (error: any) {
      return null;
    }
  }

  async deactivateBankAccounts(profileId: string, accountId: any) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(registrationBankAccountTable)
        .set({
          state: 'INACTIVE',
        })
        .where('profileId', '=', profileId)
        .where('accountId', '=', accountId)
        .where('state', '=', 'ACTIVE')
        .execute();
    } catch (error: any) {
      console.error(error);
    }
  }

  private bankAccountToBankAccountRecord(bankAccount: BankAccount): RegistrationBankAccountTable {
    const schema = bankAccount.getObject();

    return {
      accountId: schema.accountId,
      bankAccountId: schema.bankAccountId,
      northCapitalId: schema.northCapitalId,
      profileId: schema.profileId,
      plaidUrl: schema.plaidUrl,
      plaidJson: schema.plaidResult as JSONObjectOf<PlaidResult>,
      bankAccountNumber: schema.bankAccountNumber,
      bankAccountType: schema.bankAccountType,
      state: schema.state,
    };
  }

  private bankAccountRecordToBankAccount(record: RegistrationBankAccountTable): BankAccount {
    return BankAccount.create({
      accountId: record.accountId,
      bankAccountId: record.bankAccountId,
      northCapitalId: record.northCapitalId,
      profileId: record.profileId,
      plaidUrl: record.plaidUrl,
      plaidResult: record.plaidJson !== null ? (record.plaidJson as PlaidResult) : null,
      bankAccountNumber: record.bankAccountNumber,
      bankAccountType: record.bankAccountType,
      state: record.state,
    });
  }
}
