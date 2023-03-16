import {InvestmentAccounts} from "InvestmentAccounts/index";
import {AccountType} from "LegalEntities/Domain/AccountType";

/**
 * Investment Accounts Module ACL
 */
export class InvestmentAccountsService {
    public static getClassName = () => "InvestmentAccountsService";
    private investmentAccountsModule: InvestmentAccounts.Main;

    constructor(investmentAccountsModule: InvestmentAccounts.Main) {
        this.investmentAccountsModule = investmentAccountsModule;
    }

    async openAccount(profileId: string, accountId: string, accountType: AccountType): Promise<boolean> {
        const api = this.investmentAccountsModule.api();

        return api.openAccount(profileId, accountId, accountType);
    }
}