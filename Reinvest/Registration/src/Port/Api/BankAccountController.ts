import { PlaidResponse } from 'Registration/Domain/Model/BankAccount';
import { BankAccountQuery, CurrentActiveBankAccount } from 'Registration/IntegrationLogic/UseCase/BankAccount/BankAccountQuery';
import { FulfillBankAccount } from 'Registration/IntegrationLogic/UseCase/BankAccount/FulfillBankAccount';
import { InitializeBankAccount } from 'Registration/IntegrationLogic/UseCase/BankAccount/InitializeBankAccount';
import { UpdateBankAccount } from 'Registration/IntegrationLogic/UseCase/BankAccount/UpdateBankAccount';
import { ImmediateSynchronize } from 'Registration/IntegrationLogic/UseCase/ImmediateSynchronize';

export class BankAccountController {
  private initializeBankAccountUseCase: InitializeBankAccount;
  private fulfillBankAccountUseCase: FulfillBankAccount;
  private bankAccountQuery: BankAccountQuery;
  private updateBankAccountUseCase: UpdateBankAccount;
  private immediateSynchronize: ImmediateSynchronize;

  constructor(
    initializeBankAccountUseCase: InitializeBankAccount,
    fulfillBankAccountUseCase: FulfillBankAccount,
    bankAccountQuery: BankAccountQuery,
    updateBankAccountUseCase: UpdateBankAccount,
    immediateSynchronize: ImmediateSynchronize,
  ) {
    this.initializeBankAccountUseCase = initializeBankAccountUseCase;
    this.fulfillBankAccountUseCase = fulfillBankAccountUseCase;
    this.bankAccountQuery = bankAccountQuery;
    this.updateBankAccountUseCase = updateBankAccountUseCase;
    this.immediateSynchronize = immediateSynchronize;
  }

  public static getClassName = (): string => 'BankAccountController';

  public async createBankAccount(profileId: string, accountId: string) {
    await this.immediateSynchronize.immediatelySynchronizeAccount(profileId, accountId);
    const link = await this.initializeBankAccountUseCase.execute(profileId, accountId);

    if (!link) {
      return { status: false };
    }

    return {
      status: true,
      ...link,
    };
  }

  public async updateBankAccount(profileId: string, accountId: string) {
    const link = await this.updateBankAccountUseCase.execute(profileId, accountId);

    if (!link) {
      return { status: false };
    }

    return {
      status: true,
      ...link,
    };
  }

  public async fulfillBankAccount(
    profileId: string,
    accountId: string,
    input: unknown,
  ): Promise<{
    status: boolean;
  }> {
    try {
      const plaidResponse = <PlaidResponse>{
        accountNumber: this.getValue<string>(input, 'accountNumber'),
        accountType: this.getValue<string>(input, 'accountType'),
        refNumber: this.getValue<string>(input, 'refNumber'),
        routingNumber: this.getValue<string>(input, 'routingNumber'),
        accountName: this.getValue<string>(input, 'accountName', false),
        institutionId: this.getValue<string>(input, 'institutionId', false),
        institutionName: this.getValue<string>(input, 'institutionName', false),
      };

      await this.fulfillBankAccountUseCase.execute(profileId, accountId, plaidResponse);

      return { status: true };
    } catch (error) {
      console.error(error);

      return { status: false };
    }
  }

  public async readBankAccount(profileId: string, accountId: string): Promise<CurrentActiveBankAccount | null> {
    return this.bankAccountQuery.readActiveBankAccount(profileId, accountId);
  }

  private getValue<Result>(input: any, key: string, throwIfUndefined = true) {
    const value = input[key];

    if (value === undefined) {
      if (!throwIfUndefined) {
        return null;
      }

      throw new Error(`${key} is required`);
    }

    return value as Result;
  }
}
