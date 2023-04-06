import {
    legalEntitiesCompanyAccountTable,
    LegalEntitiesDatabaseAdapterProvider,
    legalEntitiesIndividualAccountTable,
    legalEntitiesProfileTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

import {
    IndividualAccount,
    IndividualAccountOverview, IndividualOverviewSchema,
    IndividualSchema
} from "LegalEntities/Domain/Accounts/IndividualAccount";
import {PersonalNameInput} from "LegalEntities/Domain/ValueObject/PersonalName";
import {AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {
    CompanyAccount,
    CompanyAccountOverview,
    CompanyOverviewSchema,
    CompanySchema
} from "LegalEntities/Domain/Accounts/CompanyAccount";
import {EIN} from "LegalEntities/Domain/ValueObject/SensitiveNumber";

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
                .onConflict((oc) => oc
                    .columns(['accountId'])
                    .doNothing()
                )
                .execute();

            return true;
        } catch (error: any) {
            console.error(`Cannot create individual account: ${error.message}`);
            return false;
        }
    }

    async findIndividualAccount(profileId: string): Promise<IndividualAccount | null> {
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
                    `${legalEntitiesIndividualAccountTable}.avatar`
                ])
                .select([`${legalEntitiesProfileTable}.name`])
                .where(`${legalEntitiesIndividualAccountTable}.profileId`, '=', profileId)
                .limit(1)
                .executeTakeFirstOrThrow();

            return IndividualAccount.create(account as IndividualSchema);
        } catch (error: any) {
            console.error(`Cannot find individual account: ${error.message}`);
            return null;
        }
    }

    async findIndividualAccountOverview(profileId: string): Promise<IndividualAccountOverview | null> {
        try {
            const account = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesIndividualAccountTable)
                .fullJoin(legalEntitiesProfileTable, `${legalEntitiesProfileTable}.profileId`, `${legalEntitiesIndividualAccountTable}.profileId`)
                .select([
                    `${legalEntitiesIndividualAccountTable}.accountId`,
                    `${legalEntitiesIndividualAccountTable}.profileId`,
                    `${legalEntitiesIndividualAccountTable}.avatar`
                ])
                .select([`${legalEntitiesProfileTable}.name`])
                .where(`${legalEntitiesIndividualAccountTable}.profileId`, '=', profileId)
                .limit(1)
                .castTo<IndividualOverviewSchema>()
                .executeTakeFirstOrThrow();

            return IndividualAccountOverview.create(account);
        } catch (error: any) {
            console.error(`Cannot find individual account: ${error.message}`);
            return null;
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

    async isEinUnique(ein: EIN): Promise<boolean> {
        const einHash = ein.getHash();
        try {
            await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesCompanyAccountTable)
                .select(['einHash'])
                .where("einHash", '=', einHash)
                .limit(1)
                .executeTakeFirstOrThrow();

            return false;
        } catch (error: any) {
            return true;
        }
    }

    async createCompanyAccount(account: CompanyAccount): Promise<boolean> {
        const {
            profileId,
            accountId,
            companyName,
            address,
            ein,
            annualRevenue,
            numberOfEmployees,
            industry,
            companyType,
            avatar,
            accountType,
            stakeholders,
            companyDocuments,
            einHash
        } = account.toObject();

        try {
            await this.databaseAdapterProvider.provide()
                .insertInto(legalEntitiesCompanyAccountTable)
                .values({
                    accountId,
                    profileId,
                    companyName: JSON.stringify(companyName),
                    address: JSON.stringify(address),
                    ein: JSON.stringify(ein),
                    annualRevenue: JSON.stringify(annualRevenue),
                    numberOfEmployees: JSON.stringify(numberOfEmployees),
                    industry: JSON.stringify(industry),
                    companyType: JSON.stringify(companyType),
                    avatar: JSON.stringify(avatar),
                    accountType: accountType,
                    companyDocuments: JSON.stringify(companyDocuments),
                    stakeholders: JSON.stringify(stakeholders),
                    einHash,
                })
                .onConflict((oc) => oc
                    .columns(['accountId'])
                    .doNothing()
                )
                .onConflict((oc) => oc
                    .columns(['einHash'])
                    .doNothing()
                )
                .execute();

            return true;
        } catch (error: any) {
            console.error(`Cannot create company account: ${error.message}`);
            return false;
        }

    }

    async findCompanyAccount(profileId: string, accountId: string): Promise<CompanyAccount | null> {
        try {
            const account = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesCompanyAccountTable)
                .select([
                    "profileId",
                    "accountId",
                    "companyName",
                    "address",
                    "ein",
                    "annualRevenue",
                    "numberOfEmployees",
                    "industry",
                    "companyType",
                    "avatar",
                    "accountType",
                    "companyDocuments",
                    "stakeholders"
                ])
                .where(`${legalEntitiesCompanyAccountTable}.profileId`, '=', profileId)
                .where(`${legalEntitiesCompanyAccountTable}.accountId`, '=', accountId)
                .limit(1)
                .castTo<CompanySchema>()
                .executeTakeFirstOrThrow();

            return CompanyAccount.create(account);
        } catch (error: any) {
            console.error(`Cannot find any company account: ${error.message}`);
            return null;
        }
    }

    async findCompanyAccountOverviews(profileId: string): Promise<CompanyAccountOverview[]> {
        try {
            const accounts = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesCompanyAccountTable)
                .select([
                    "accountId",
                    "profileId",
                    "companyName",
                    "avatar",
                    "accountType",
                ])
                .where(`${legalEntitiesCompanyAccountTable}.profileId`, '=', profileId)
                .castTo<CompanyOverviewSchema>()
                .execute();

            return accounts.map((account) => CompanyAccountOverview.create(account));
        } catch (error: any) {
            console.error(`Cannot find any company account: ${error.message}`);
            return [];
        }
    }
}