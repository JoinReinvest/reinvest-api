import {
    LegalEntitiesDatabaseAdapterProvider,
    legalEntitiesIndividualAccountTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

import {IndividualAccount, IndividualSchema} from "LegalEntities/Domain/Accounts/IndividualAccount";
import {AccountsOverviewResponse} from "LegalEntities/Port/Api/ReadAccountController";
import {AccountType} from "LegalEntities/Domain/AccountType";

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

    async findIndividualAccount(profileId: string, accountId: string): Promise<IndividualAccount | null> {
        try {
            const account = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesIndividualAccountTable)
                .select(['accountId', 'profileId', 'employmentStatus', 'employer', 'netWorth', 'netIncome', 'avatar'])
                .where("accountId", '=', accountId)
                .where("profileId", '=', profileId)
                .limit(1)
                .executeTakeFirstOrThrow();

            return IndividualAccount.create(account as IndividualSchema);
        } catch (error: any) {
            console.error(`Cannot find individual account: ${error.message}`);
            return null;
        }
    }

    async getAllIndividualAccounts(profileId: string): Promise<IndividualAccount[]> {
        try {
            const accounts = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesIndividualAccountTable)
                .select(['accountId', 'avatar'])
                .where("profileId", '=', profileId)
                .execute();

            return accounts.map((account) => IndividualAccount.create(account as IndividualSchema));
        } catch (error: any) {
            console.error(`Cannot find individual account: ${error.message}`);
            return [];
        }
    }
}