export type BankAccountSchema = {
  accountId: string;
  bankAccountId: string;
  bankAccountNumber: string | null;
  bankAccountType: string | null;
  northCapitalId: string;
  plaidResult: PlaidResult | null;
  plaidUrl: string | null;
  profileId: string;
  state: 'ACTIVE' | 'INACTIVE' | 'IN_PROGRESS';
};

export type PlaidResult = {
  accountNickName: string;
  accountNumber: string;
  accountType: string;
  refNumber: string;
  routingNumber: string;
  accountName?: string;
  institutionId?: string;
  institutionName?: string;
};

export type PlaidResponse = {
  accountNumber: string;
  accountType: string;
  refNumber: string;
  routingNumber: string;
  accountName?: string;
  institutionId?: string;
  institutionName?: string;
};

export type PlaidLink = {
  link: string;
};

export class BankAccount {
  private readonly bankAccountId: string;
  private readonly northCapitalId: string;
  private readonly profileId: string;
  private readonly accountId: string;
  private state: 'ACTIVE' | 'INACTIVE' | 'IN_PROGRESS' = 'IN_PROGRESS';
  private plaidUrl: string | null = null;
  private plaidResult: PlaidResult | null = null;
  private bankAccountNumber: string | null = null;
  private bankAccountType: string | null = null;

  constructor(bankAccountId: string, northCapitalId: string, profileId: string, accountId: string) {
    this.bankAccountId = bankAccountId;
    this.northCapitalId = northCapitalId;
    this.profileId = profileId;
    this.accountId = accountId;
  }

  static create(bankAccountSchema: BankAccountSchema): BankAccount {
    const { bankAccountId, northCapitalId, profileId, accountId } = bankAccountSchema;
    const bankAccount = new BankAccount(bankAccountId, northCapitalId, profileId, accountId);

    if (bankAccountSchema.plaidUrl) {
      bankAccount.setPlaidUrl(bankAccountSchema.plaidUrl);
    }

    if (bankAccountSchema.state && bankAccountSchema.state === 'ACTIVE') {
      bankAccount.activate();
    }

    if (bankAccountSchema.state && bankAccountSchema.state === 'INACTIVE') {
      bankAccount.deactivate();
    }

    if (bankAccountSchema.plaidResult) {
      bankAccount.setPlaidResult(bankAccountSchema.plaidResult);
    }

    return bankAccount;
  }

  setPlaidUrl(plaidUrl: string): void {
    this.plaidUrl = plaidUrl;
  }

  getPlaidLink(): PlaidLink | null {
    if (this.plaidUrl === null) {
      return null;
    }

    return {
      link: this.plaidUrl,
    };
  }

  fulfill(plaidResult: PlaidResult): boolean {
    if (this.state !== 'IN_PROGRESS' || this.plaidResult !== null) {
      return false;
    }

    this.setPlaidResult(plaidResult);

    return true;
  }

  setPlaidResult(plaidResult: PlaidResult): void {
    this.plaidResult = plaidResult;
    this.bankAccountNumber = plaidResult.accountNumber;
    this.bankAccountType = plaidResult.accountType;
  }

  activate() {
    this.state = 'ACTIVE';
  }

  deactivate() {
    this.state = 'INACTIVE';
  }

  getObject(): BankAccountSchema {
    return {
      accountId: this.accountId,
      bankAccountId: this.bankAccountId,
      bankAccountNumber: this.bankAccountNumber,
      bankAccountType: this.bankAccountType,
      northCapitalId: this.northCapitalId,
      plaidResult: this.plaidResult,
      plaidUrl: this.plaidUrl,
      profileId: this.profileId,
      state: this.state,
    };
  }

  getMaskedAccountNumber(): string | null {
    if (!this.bankAccountNumber) {
      return null;
    }

    return this.bankAccountNumber.replace(/.(?=.{4})/g, '*').replace(/(\*{4})/g, '$1 ');
  }

  getNorthCapitalId(): string {
    return this.northCapitalId;
  }

  getNickName(): string | null {
    return this.plaidResult?.accountNickName || null;
  }

  getBankName(): string {
    return this.plaidResult?.institutionName || '';
  }
}
