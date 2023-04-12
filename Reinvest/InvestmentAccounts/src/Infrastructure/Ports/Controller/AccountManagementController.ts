import {AccountType} from "InvestmentAccounts/Domain/ProfileAggregate/AccountType";
import {OpenAccount} from "InvestmentAccounts/Application/OpenAccount";

export class AccountManagementController {
    public static getClassName = (): string => "AccountManagementController";
    private openAccountUseCase: OpenAccount;

    constructor(openAccount: OpenAccount) {
        this.openAccountUseCase = openAccount;
    }

    async openAccount(profileId: string, accountId: string, accountType: AccountType): Promise<boolean> {
        try {
            await this.openAccountUseCase.execute(profileId, accountId, accountType);
        } catch (error: any) {
            console.error("Opening account error", error);
            return error.message === "THE_ACCOUNT_ALREADY_OPENED";
        }
        return true;
    }

    async listAccountTypesUserCanOpen(profileId: string): Promise<AccountType[]> {
        return await this.openAccountUseCase.listAccountTypesUserCanOpen(profileId);
    }
}