import {
    LegalEntitiesDatabaseAdapterProvider,
    legalEntitiesIndividualAccountTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

import {IndividualAccount} from "LegalEntities/Domain/Accounts/IndividualAccount";

export class AccountRepository {
    public static getClassName = (): string => "AccountRepository";
    private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;

    constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider) {
        this.databaseAdapterProvider = databaseAdapterProvider;
    }

    async createIndividualAccount(account: IndividualAccount): Promise<boolean> {
        const {accountId, profileId, employmentStatus, employer, netIncome, netWorth, avatar} = account.toObject();
        try {
            await this.databaseAdapterProvider.provide()
                .insertInto(legalEntitiesIndividualAccountTable)
                .values({
                    accountId,
                    profileId,
                    employmentStatus: JSON.stringify(employmentStatus),
                    employer: JSON.stringify(employer),
                    netWorth: JSON.stringify(netWorth),
                    netIncome: JSON.stringify(netIncome),
                    avatar: JSON.stringify(avatar),
                })
                .execute();

            return true;
        } catch (error: any) {
            console.error(`Cannot create individual account: ${error.message}`);
            return false;
        }
    }
}