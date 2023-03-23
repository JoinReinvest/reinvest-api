import {
    LegalEntitiesDatabaseAdapterProvider,
    legalEntitiesIndividualAccountTable, legalEntitiesProfileTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

import {IndividualAccount, IndividualSchema} from "LegalEntities/Domain/Accounts/IndividualAccount";
import {PersonalNameInput} from "LegalEntities/Domain/ValueObject/PersonalName";
import {AddressInput} from "LegalEntities/Domain/ValueObject/Address";

export type IndividualAccountForSynchronization = {
    accountId: string,
    profileId: string,
    name: PersonalNameInput,
    address: AddressInput,
    employmentStatus?: string | null,
    nameOfEmployer?: string | null,
    title?: string | null,
    industry?: string | null,
    netWorth?: string | null,
    netIncome?: string | null,
}

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

    async getIndividualAccountForSynchronization(profileId: string, accountId: string): Promise<IndividualAccountForSynchronization | null> {
        try {
            const account = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesIndividualAccountTable)
                .fullJoin(legalEntitiesProfileTable, `${legalEntitiesProfileTable}.profileId`, `${legalEntitiesIndividualAccountTable}.profileId`)
                .select([
                    `${legalEntitiesIndividualAccountTable}.accountId`,
                    `${legalEntitiesIndividualAccountTable}.profileId`,
                    `${legalEntitiesIndividualAccountTable}.employmentStatus`,
                    `${legalEntitiesIndividualAccountTable}.employer`,
                    `${legalEntitiesIndividualAccountTable}.netWorth`,
                    `${legalEntitiesIndividualAccountTable}.netIncome`,
                ])
                .select([
                    `${legalEntitiesProfileTable}.name`,
                    `${legalEntitiesProfileTable}.address`,
                ])
                .where(`${legalEntitiesIndividualAccountTable}.accountId`, '=', accountId)
                .where(`${legalEntitiesIndividualAccountTable}.profileId`, '=', profileId)
                .limit(1)
                .executeTakeFirstOrThrow();

            return {
                accountId: account.accountId as string,
                profileId: account.profileId as string,
                name: account.name as unknown as PersonalNameInput,
                address: account.address as unknown as AddressInput,
                //@ts-ignore
                employmentStatus: account.employmentStatus?.status,
                //@ts-ignore
                nameOfEmployer: account.employer?.nameOfEmployer,
                //@ts-ignore
                title: account.employer?.title,
                //@ts-ignore
                industry: account.employer?.industry,
                //@ts-ignore
                netWorth: account.netWorth?.range,
                //@ts-ignore
                netIncome: account.netIncome?.range,
            }
        } catch (error: any) {
            return null;
        }

    }
}