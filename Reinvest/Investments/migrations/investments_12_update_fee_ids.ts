import { InvestmentsDatabase, investmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema
    .alterTable(investmentsFeesTable)
    .alterColumn('verificationFeeId', col => col.setDataType('json'))
    .renameColumn('verificationFeeId', 'verificationFeeIdsJson')
    .execute();
}

export async function down(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema
    .alterTable(investmentsFeesTable)
    .renameColumn('verificationFeeIdsJson', 'verificationFeeId')
    .alterColumn('verificationFeeId', col => col.setDataType('uuid'))
    .execute();
}
