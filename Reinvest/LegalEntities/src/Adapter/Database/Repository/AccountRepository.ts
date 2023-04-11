import {
    legalEntitiesCompanyAccountTable,
    LegalEntitiesDatabaseAdapterProvider,
    legalEntitiesIndividualAccountTable,
    legalEntitiesProfileTable,
} from "LegalEntities/Adapter/Database/DatabaseAdapter";

import {
    IndividualAccount,
    IndividualAccountOverview,
    IndividualOverviewSchema,
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
import {EIN, SensitiveNumberSchema, SSN} from "LegalEntities/Domain/ValueObject/SensitiveNumber";
import {CompanyNameInput, CompanyTypeInput} from "LegalEntities/Domain/ValueObject/Company";
import {DocumentSchema} from "LegalEntities/Domain/ValueObject/Document";
import {StakeholderOutput, StakeholderSchema} from "LegalEntities/Domain/ValueObject/Stakeholder";
import {AccountType} from "LegalEntities/Domain/AccountType";
import {DomicileType} from "LegalEntities/Domain/ValueObject/Domicile";

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

export type CompanyAccountForSynchronization = {
    accountId: string,
    profileId: string,
    ownerName: PersonalNameInput,
    address: AddressInput,
    companyType: CompanyTypeInput,
    stakeholders: { id: string }[],
}

export type CompanyForSynchronization = {
    accountId: string,
    profileId: string,
    companyName: CompanyNameInput,
    address: AddressInput,
    ein: string | null,
    companyType: CompanyTypeInput,
    companyDocuments: DocumentSchema[],
    accountType: string
}

export type StakeholderForSynchronization = StakeholderOutput & {
    accountId: string,
    profileId: string,
    domicile: DomicileType,
    idScan: DocumentSchema[],
    dateOfBirth: string;
    accountType: string;
    ssn: string | null
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

    async getCompanyAccountForSynchronization(profileId: string, accountId: string): Promise<CompanyAccountForSynchronization | null> {
        try {
            const account = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesCompanyAccountTable)
                .fullJoin(legalEntitiesProfileTable, `${legalEntitiesProfileTable}.profileId`, `${legalEntitiesCompanyAccountTable}.profileId`)
                .select([
                    `${legalEntitiesCompanyAccountTable}.accountId`,
                    `${legalEntitiesCompanyAccountTable}.profileId`,
                    `${legalEntitiesCompanyAccountTable}.address`,
                    `${legalEntitiesCompanyAccountTable}.companyType`,
                    `${legalEntitiesCompanyAccountTable}.stakeholders`,
                ])
                .select([
                    `${legalEntitiesProfileTable}.name`,
                ])
                .where(`${legalEntitiesCompanyAccountTable}.accountId`, '=', accountId)
                .where(`${legalEntitiesCompanyAccountTable}.profileId`, '=', profileId)
                .limit(1)
                .executeTakeFirstOrThrow();


            return {
                accountId: account.accountId as string,
                profileId: account.profileId as string,
                ownerName: account.name as unknown as PersonalNameInput,
                address: account.address as unknown as AddressInput,
                companyType: account.companyType as unknown as CompanyTypeInput,
                stakeholders: !account.stakeholders
                    ? []
                    // @ts-ignore
                    : account.stakeholders.map((stakeholder: StakeholderSchema): { id: string } => ({
                        id: stakeholder.id
                    })),
            }
        } catch (error: any) {
            return null;
        }
    }

    async getCompanyForSynchronization(profileId: string, accountId: string): Promise<CompanyForSynchronization | null> {
        try {
            const account = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesCompanyAccountTable)
                .select([
                    `${legalEntitiesCompanyAccountTable}.accountId`,
                    `${legalEntitiesCompanyAccountTable}.profileId`,
                    `${legalEntitiesCompanyAccountTable}.companyName`,
                    `${legalEntitiesCompanyAccountTable}.address`,
                    `${legalEntitiesCompanyAccountTable}.ein`,
                    `${legalEntitiesCompanyAccountTable}.companyType`,
                    `${legalEntitiesCompanyAccountTable}.companyDocuments`,
                    `${legalEntitiesCompanyAccountTable}.accountType`,
                ])

                .where(`${legalEntitiesCompanyAccountTable}.accountId`, '=', accountId)
                .where(`${legalEntitiesCompanyAccountTable}.profileId`, '=', profileId)
                .limit(1)
                .executeTakeFirstOrThrow();

            let ein = null;
            try {
                const einObject = EIN.create(account.ein as unknown as SensitiveNumberSchema);
                ein = einObject.decrypt();
            } catch (error: any) {
                console.warn(`Cannot decrypt EIN: ${error.message}`);
            }

            return {
                accountId: account.accountId as string,
                profileId: account.profileId as string,
                companyName: account.companyName as unknown as CompanyNameInput,
                address: account.address as unknown as AddressInput,
                ein,
                companyType: account.companyType as unknown as CompanyTypeInput,
                companyDocuments: account.companyDocuments as unknown as DocumentSchema[],
                accountType: account.accountType as unknown as AccountType,

            }
        } catch (error: any) {
            return null;
        }
    }

    async getStakeholderForSynchronization(profileId: string, accountId: string, stakeholderId: string): Promise<StakeholderForSynchronization | null> {
        try {
            const account = await this.databaseAdapterProvider.provide()
                .selectFrom(legalEntitiesCompanyAccountTable)
                .select([
                    `${legalEntitiesCompanyAccountTable}.accountId`,
                    `${legalEntitiesCompanyAccountTable}.profileId`,
                    `${legalEntitiesCompanyAccountTable}.accountType`,
                    `${legalEntitiesCompanyAccountTable}.stakeholders`,
                ])
                .where(`${legalEntitiesCompanyAccountTable}.accountId`, '=', accountId)
                .where(`${legalEntitiesCompanyAccountTable}.profileId`, '=', profileId)
                .limit(1)
                .executeTakeFirstOrThrow();

            const stakeholders = account.stakeholders as unknown as StakeholderSchema[];
            const stakeholder = stakeholders?.find((stakeholder: StakeholderSchema) => stakeholder.id === stakeholderId);

            if (!stakeholder) {
                return null;
            }
            let ssn = null;
            if (stakeholder.ssn) {
                try {
                    const ssnObject = SSN.create(stakeholder.ssn as unknown as SensitiveNumberSchema);
                    ssn = ssnObject.decrypt();
                } catch (error: any) {
                    console.warn(`Cannot decrypt SSN: ${error.message}`);
                }
            }

            return {
                accountId: account.accountId as string,
                profileId: account.profileId as string,
                accountType: account.accountType as string,
                ...stakeholder,
                // @ts-ignore
                domicile: stakeholder.domicile.type,
                // @ts-ignore
                dateOfBirth: stakeholder.dateOfBirth.dateOfBirth,
                // @ts-ignore
                ssn
            }
        } catch (error: any) {
            return null;
        }
    }
}