import { Kysely, sql } from 'kysely';
import { legalEntitiesCompanyAccountTable, LegalEntitiesDatabase, legalEntitiesProfileTable } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { CompanyAccountType } from 'LegalEntities/Domain/Accounts/CompanyAccount';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(legalEntitiesCompanyAccountTable)
    .addColumn('initialsValue', 'integer', col => col.defaultTo(null))
    .execute();

  const profileIds = await db.selectFrom(legalEntitiesProfileTable).select('profileId').execute();

  for (const { profileId } of profileIds) {
    await updateCompanies(db, profileId, CompanyAccountType.CORPORATE);

    await updateCompanies(db, profileId, CompanyAccountType.TRUST);
  }
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(legalEntitiesCompanyAccountTable).dropColumn('initialsValue').execute();
}

const updateCompanies = async (db: Kysely<LegalEntitiesDatabase>, profileId: string, companyAccountType: CompanyAccountType) => {
  const companies = await db
    .selectFrom(legalEntitiesCompanyAccountTable)
    .select(['accountId', 'initialsValue'])
    .where('profileId', '=', profileId)
    .where('accountType', '=', companyAccountType)
    .execute();

  if (!companies.length) {
    return;
  }

  let lastMaxInitialsValue = Math.max(...companies.map(el => el.initialsValue));

  let newValue = ++lastMaxInitialsValue;

  for (const { accountId } of companies) {
    await db.updateTable(legalEntitiesCompanyAccountTable).set({ initialsValue: newValue }).where('accountId', '=', accountId).execute();
    newValue++;
  }
};
