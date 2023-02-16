import {InvestmentAccountDbProvider} from "InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter";

export class TransactionalAdapter {
    static getClassName = (): string => "TransactionalAdapter";
    private databaseProvider: InvestmentAccountDbProvider;

    constructor(databaseProvider: InvestmentAccountDbProvider) {
        this.databaseProvider = databaseProvider;
    }

    public async transaction(callback: Function): Promise<void> {
        await this.databaseProvider.provide().transaction().execute(async () => {
            callback();
        });
    }
}