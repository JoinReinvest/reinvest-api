import { JSONObjectOf } from 'HKEKTypes/Generics';

export type BankAccountSchema = {
  accountId: string;
  bankAccountId: string;
  bankAccountNumber: string;
  bankAccountType: string;
  createdDate: Date;
  northCapitalId: string;
  plaidJson: JSONObjectOf<any>;
  plaidUrl: string | null;
  profileId: string;
  state: 'ACTIVE' | 'INACTIVE';
};

export class BankAccount {
  private bankAccountId: string;
  private northCapitalId: string;
  private profileId: string;
  private accountId: string;

  constructor(bankAccountId: string, northCapitalId: string, profileId: string, accountId: string) {
    this.bankAccountId = bankAccountId;
    this.northCapitalId = northCapitalId;
    this.profileId = profileId;
    this.accountId = accountId;
  }

  static create(bankAccountSchema: BankAccountSchema): BankAccount {
    const { bankAccountId, northCapitalId, profileId, accountId } = bankAccountSchema;

    return new BankAccount(bankAccountId, northCapitalId, profileId, accountId);
  }
}
