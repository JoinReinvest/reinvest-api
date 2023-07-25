import { OpenAccount } from 'InvestmentAccounts/Application/OpenAccount';
import { RemoveBeneficiary } from 'InvestmentAccounts/Application/RemoveBeneficiary';
import { AccountType } from 'InvestmentAccounts/Domain/ProfileAggregate/AccountType';

export class AccountManagementController {
  public static getClassName = (): string => 'AccountManagementController';
  private openAccountUseCase: OpenAccount;
  private removeBeneficiaryUseCase: RemoveBeneficiary;

  constructor(openAccount: OpenAccount, removeBeneficiaryUseCase: RemoveBeneficiary) {
    this.openAccountUseCase = openAccount;
    this.removeBeneficiaryUseCase = removeBeneficiaryUseCase;
  }

  async openAccount(profileId: string, accountId: string, accountType: AccountType): Promise<boolean> {
    try {
      await this.openAccountUseCase.execute(profileId, accountId, accountType);
    } catch (error: any) {
      if (error.message === 'THE_ACCOUNT_ALREADY_OPENED') {
        return true;
      }

      console.error('Opening account error', error);

      return false;
    }

    return true;
  }

  async removeBeneficiary(profileId: string, accountId: string): Promise<boolean> {
    try {
      await this.removeBeneficiaryUseCase.execute(profileId, accountId);

      return true;
    } catch (error: any) {
      console.error('Cannot remove beneficiary from investment account', error);

      return false;
    }
  }

  async listAccountTypesUserCanOpen(profileId: string): Promise<AccountType[]> {
    return await this.openAccountUseCase.listAccountTypesUserCanOpen(profileId);
  }
}
