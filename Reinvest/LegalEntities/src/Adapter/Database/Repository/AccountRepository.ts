import {
  legalEntitiesBeneficiaryTable,
  legalEntitiesCompanyAccountTable,
  LegalEntitiesDatabaseAdapterProvider,
  legalEntitiesIndividualAccountTable,
  legalEntitiesProfileTable,
} from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { LegalEntitiesCompanyAccount } from 'LegalEntities/Adapter/Database/LegalEntitiesSchema';
import { CompanyAccount, CompanyAccountOverview, CompanyOverviewSchema, CompanySchema } from 'LegalEntities/Domain/Accounts/CompanyAccount';
import { IndividualAccount, IndividualAccountOverview, IndividualOverviewSchema, IndividualSchema } from 'LegalEntities/Domain/Accounts/IndividualAccount';
import { AccountType } from 'LegalEntities/Domain/AccountType';
import { AddressInput } from 'LegalEntities/Domain/ValueObject/Address';
import { CompanyNameInput, CompanyTypeInput } from 'LegalEntities/Domain/ValueObject/Company';
import { DocumentSchema } from 'LegalEntities/Domain/ValueObject/Document';
import { SimplifiedDomicileType } from 'LegalEntities/Domain/ValueObject/Domicile';
import { PersonalNameInput } from 'LegalEntities/Domain/ValueObject/PersonalName';
import { EIN, SensitiveNumberSchema, SSN } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { StakeholderOutput, StakeholderSchema } from 'LegalEntities/Domain/ValueObject/Stakeholder';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export type IndividualAccountForSynchronization = {
  accountId: string;
  address: AddressInput;
  name: PersonalNameInput;
  profileId: string;
  employmentStatus?: string | null;
  industry?: string | null;
  nameOfEmployer?: string | null;
  netIncome?: string | null;
  netWorth?: string | null;
  title?: string | null;
};

export type BeneficiaryAccountForSynchronization = {
  accountId: string;
  ownerName: PersonalNameInput;
  parentId: string;
  profileId: string;
};

export type CompanyAccountForSynchronization = {
  accountId: string;
  address: AddressInput;
  companyType: CompanyTypeInput;
  ownerName: PersonalNameInput;
  profileId: string;
  stakeholders: { id: string }[];
};

export type CompanyForSynchronization = {
  accountId: string;
  accountType: string;
  address: AddressInput;
  companyDocuments: DocumentSchema[];
  companyName: CompanyNameInput;
  companyType: CompanyTypeInput;
  ein: string | null;
  profileId: string;
};

export type StakeholderForSynchronization = StakeholderOutput & {
  accountId: string;
  accountType: string;
  dateOfBirth: string;
  domicile: SimplifiedDomicileType;
  idScan: DocumentSchema[];
  profileId: string;
  ssn: string | null;
};

export class AccountRepository {
  private databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: LegalEntitiesDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'AccountRepository';

  async createIndividualAccount(account: IndividualAccount): Promise<boolean> {
    const { accountId, profileId, employmentStatus, employer, netIncome, netWorth, avatar } = account.toObject();
    try {
      if (await this.isAccountAlreadyOpened(accountId, legalEntitiesIndividualAccountTable)) {
        return true;
      }

      await this.databaseAdapterProvider
        .provide()
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
        .onConflict(oc => oc.columns(['accountId']).doNothing())
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create individual account: ${error.message}`, error);

      return false;
    }
  }

  async findIndividualAccount(profileId: string): Promise<IndividualAccount | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
        .selectFrom(legalEntitiesIndividualAccountTable)
        .fullJoin(legalEntitiesProfileTable, `${legalEntitiesProfileTable}.profileId`, `${legalEntitiesIndividualAccountTable}.profileId`)
        .select([
          `${legalEntitiesIndividualAccountTable}.accountId`,
          `${legalEntitiesIndividualAccountTable}.profileId`,
          `${legalEntitiesIndividualAccountTable}.employmentStatus`,
          `${legalEntitiesIndividualAccountTable}.employer`,
          `${legalEntitiesIndividualAccountTable}.netWorth`,
          `${legalEntitiesIndividualAccountTable}.netIncome`,
          `${legalEntitiesIndividualAccountTable}.avatar`,
        ])
        .select([`${legalEntitiesProfileTable}.name`])
        .where(`${legalEntitiesIndividualAccountTable}.profileId`, '=', profileId)
        .limit(1)
        .executeTakeFirstOrThrow();

      return IndividualAccount.create(account as IndividualSchema);
    } catch (error: any) {
      console.warn(`Cannot find individual account: ${error.message}`);

      return null;
    }
  }

  async findIndividualAccountOverview(profileId: string): Promise<IndividualAccountOverview | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
        .selectFrom(legalEntitiesIndividualAccountTable)
        .fullJoin(legalEntitiesProfileTable, `${legalEntitiesProfileTable}.profileId`, `${legalEntitiesIndividualAccountTable}.profileId`)
        .select([
          `${legalEntitiesIndividualAccountTable}.accountId`,
          `${legalEntitiesIndividualAccountTable}.profileId`,
          `${legalEntitiesIndividualAccountTable}.avatar`,
        ])
        .select([`${legalEntitiesProfileTable}.name`])
        .where(`${legalEntitiesIndividualAccountTable}.profileId`, '=', profileId)
        .limit(1)
        .castTo<IndividualOverviewSchema>()
        .executeTakeFirstOrThrow();

      return IndividualAccountOverview.create(account);
    } catch (error: any) {
      console.warn(`Cannot find individual account: ${error.message}`);

      return null;
    }
  }

  async getIndividualAccountForSynchronization(profileId: string, accountId: string): Promise<IndividualAccountForSynchronization | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
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
        .select([`${legalEntitiesProfileTable}.name`, `${legalEntitiesProfileTable}.address`])
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
      };
    } catch (error: any) {
      return null;
    }
  }

  async getBeneficiaryAccountForSynchronization(profileId: string, accountId: string): Promise<BeneficiaryAccountForSynchronization | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
        .selectFrom(legalEntitiesBeneficiaryTable)
        .fullJoin(legalEntitiesProfileTable, `${legalEntitiesProfileTable}.profileId`, `${legalEntitiesBeneficiaryTable}.profileId`)
        .select([`${legalEntitiesBeneficiaryTable}.accountId`, `${legalEntitiesBeneficiaryTable}.profileId`, `${legalEntitiesBeneficiaryTable}.individualId`])
        .select([`${legalEntitiesProfileTable}.name`])
        .where(`${legalEntitiesBeneficiaryTable}.accountId`, '=', accountId)
        .where(`${legalEntitiesBeneficiaryTable}.profileId`, '=', profileId)
        .limit(1)
        .executeTakeFirstOrThrow();

      return {
        accountId: account.accountId as string,
        profileId: account.profileId as string,
        ownerName: account.name as unknown as PersonalNameInput,
        parentId: account.individualId as string,
      };
    } catch (error: any) {
      return null;
    }
  }

  async isEinUnique(ein: EIN, accountId: string | null = null): Promise<boolean> {
    const einHash = ein.getHash();
    try {
      let qb = this.databaseAdapterProvider.provide().selectFrom(legalEntitiesCompanyAccountTable).select(['einHash']).where('einHash', '=', einHash);

      if (accountId) {
        qb = qb.where('accountId', '!=', accountId);
      }

      await qb.limit(1).executeTakeFirstOrThrow();

      return false;
    } catch (error: any) {
      return true;
    }
  }

  async isAccountAlreadyOpened(accountId: string, table: 'legal_entities_individual_account' | 'legal_entities_company_account'): Promise<boolean> {
    try {
      const result = await this.databaseAdapterProvider
        .provide()
        .selectFrom(table)
        .select(['accountId'])
        .where('accountId', '=', accountId)
        .limit(1)
        .executeTakeFirst();

      if (result) {
        return true;
      }

      return false;
    } catch (error: any) {
      return false;
    }
  }

  private async getNewInitials(profileId: string, accountType: AccountType) {
    const initials = await this.databaseAdapterProvider
      .provide()
      .selectFrom(legalEntitiesCompanyAccountTable)
      .select('initialValue')
      .where('profileId', '=', profileId)
      .where('accountType', '=', accountType)
      .execute();

    let lastMaxInitialValue = Math.max(...initials.map(el => el.initialValue));
    const initialValue = lastMaxInitialValue++;

    return initialValue;
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
      einHash,
    } = account.toObject();

    try {
      if (await this.isAccountAlreadyOpened(accountId, legalEntitiesCompanyAccountTable)) {
        return true;
      }

      const initialValue = await this.getNewInitials(profileId, accountType);

      await this.databaseAdapterProvider
        .provide()
        .insertInto(legalEntitiesCompanyAccountTable)
        .values(<LegalEntitiesCompanyAccount>{
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
          initialValue,
        })
        .onConflict(oc => oc.columns(['einHash']).doNothing())
        .execute();

      return true;
    } catch (error: any) {
      console.warn(`Cannot create company account: ${error.message}`, error);

      return false;
    }
  }

  async updateIndividualAccount(account: IndividualAccount, events: DomainEvent[] = []): Promise<void> {
    const { employmentStatus, employer, netWorth, netIncome, avatar, profileId, accountId } = account.toObject();

    await this.databaseAdapterProvider
      .provide()
      .updateTable(legalEntitiesIndividualAccountTable)
      .set({
        employmentStatus: JSON.stringify(employmentStatus),
        employer: JSON.stringify(employer),
        netWorth: JSON.stringify(netWorth),
        netIncome: JSON.stringify(netIncome),
        avatar: JSON.stringify(avatar),
      })
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .execute();

    await this.publishEvents(events);
  }

  async updateCompanyAccount(account: CompanyAccount, events: DomainEvent[] = []): Promise<void> {
    const { profileId, accountId, address, companyType, stakeholders, companyDocuments, annualRevenue, avatar, industry, numberOfEmployees } =
      account.toObject();

    const values: Partial<LegalEntitiesCompanyAccount> = {
      address: JSON.stringify(address),
      companyType: JSON.stringify(companyType),
      companyDocuments: JSON.stringify(companyDocuments),
      stakeholders: JSON.stringify(stakeholders),
      avatar: JSON.stringify(avatar),
      annualRevenue: JSON.stringify(annualRevenue),
      industry: JSON.stringify(industry),
      numberOfEmployees: JSON.stringify(numberOfEmployees),
    };

    await this.databaseAdapterProvider
      .provide()
      .updateTable(legalEntitiesCompanyAccountTable)
      .set({
        ...values,
      })
      .where('accountId', '=', accountId)
      .where('profileId', '=', profileId)
      .execute();

    await this.publishEvents(events);
  }

  async findCompanyAccount(profileId: string, accountId: string): Promise<CompanyAccount | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
        .selectFrom(legalEntitiesCompanyAccountTable)
        .select([
          'profileId',
          'accountId',
          'companyName',
          'address',
          'ein',
          'annualRevenue',
          'numberOfEmployees',
          'industry',
          'companyType',
          'avatar',
          'accountType',
          'companyDocuments',
          'stakeholders',
          'initialValue',
        ])
        .where(`${legalEntitiesCompanyAccountTable}.profileId`, '=', profileId)
        .where(`${legalEntitiesCompanyAccountTable}.accountId`, '=', accountId)
        .limit(1)
        .castTo<CompanySchema>()
        .executeTakeFirstOrThrow();

      return CompanyAccount.create(account);
    } catch (error: any) {
      console.warn(`Cannot find any company account: ${error.message}`);

      return null;
    }
  }

  async findCompanyAccountOverviews(profileId: string): Promise<CompanyAccountOverview[]> {
    try {
      const accounts = await this.databaseAdapterProvider
        .provide()
        .selectFrom(legalEntitiesCompanyAccountTable)
        .select(['accountId', 'profileId', 'companyName', 'avatar', 'accountType'])
        .where(`${legalEntitiesCompanyAccountTable}.profileId`, '=', profileId)
        .castTo<CompanyOverviewSchema>()
        .execute();

      return accounts.map(account => CompanyAccountOverview.create(account));
    } catch (error: any) {
      console.warn(`Cannot find any company account: ${error.message}`);

      return [];
    }
  }

  async getCompanyAccountForSynchronization(profileId: string, accountId: string): Promise<CompanyAccountForSynchronization | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
        .selectFrom(legalEntitiesCompanyAccountTable)
        .fullJoin(legalEntitiesProfileTable, `${legalEntitiesProfileTable}.profileId`, `${legalEntitiesCompanyAccountTable}.profileId`)
        .select([
          `${legalEntitiesCompanyAccountTable}.accountId`,
          `${legalEntitiesCompanyAccountTable}.profileId`,
          `${legalEntitiesCompanyAccountTable}.address`,
          `${legalEntitiesCompanyAccountTable}.companyType`,
          `${legalEntitiesCompanyAccountTable}.stakeholders`,
        ])
        .select([`${legalEntitiesProfileTable}.name`])
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
          : // @ts-ignore
            account.stakeholders.map((stakeholder: StakeholderSchema): { id: string } => ({
              id: stakeholder.id,
            })),
      };
    } catch (error: any) {
      return null;
    }
  }

  async getCompanyForSynchronization(profileId: string, accountId: string): Promise<CompanyForSynchronization | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
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
      };
    } catch (error: any) {
      return null;
    }
  }

  async getStakeholderForSynchronization(profileId: string, accountId: string, stakeholderId: string): Promise<StakeholderForSynchronization | null> {
    try {
      const account = await this.databaseAdapterProvider
        .provide()
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
        ssn,
      };
    } catch (error: any) {
      return null;
    }
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }
}
