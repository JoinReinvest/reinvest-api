import { InvestmentsDatabase, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema
    .alterTable(investmentsTable)
    .addColumn('unitPrice', 'int8', col => col.notNull().defaultTo(0))
    .execute();
}

export async function down(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsTable).dropColumn('unitPrice').execute();
}
