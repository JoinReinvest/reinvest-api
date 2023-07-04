import { UUID } from "HKEKTypes/Generics";
import { AccountType as InvestmentAccountType } from "InvestmentAccounts/Domain/ProfileAggregate/AccountType";
import { InvestmentAccounts } from "InvestmentAccounts/index";
import { AccountType } from "LegalEntities/Domain/AccountType";

/**
 * Investment Accounts Module ACL
 */
export class InvestmentAccountsService {
  public static getClassName = () => 'InvestmentAccountsService';
  private investmentAccountsModule: InvestmentAccounts.Main;

  constructor(investmentAccountsModule: InvestmentAccounts.Main) {
    this.investmentAccountsModule = investmentAccountsModule;
  }

  async openAccount(profileId: string, accountId: string, accountType: AccountType): Promise<boolean> {
    const api = this.investmentAccountsModule.api();

    return api.openAccount(profileId, accountId, accountType as InvestmentAccountType);
  }

  async removeBeneficiary(profileId: UUID, accountId: UUID): Promise<boolean> {
    const api = this.investmentAccountsModule.api();

    return api.removeBeneficiary(profileId, accountId);
  }
}
