import { Kysely, sql } from 'kysely';
import { NotificationsDatabase, storedEventsTable } from 'Notifications/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema
    .createTable(storedEventsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('kind', 'varchar(64)', col => col.notNull())
    .addColumn('payloadJson', 'json', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateInApp', 'timestamp', col => col.defaultTo(null))
    .addColumn('datePushed', 'timestamp', col => col.defaultTo(null))
    .addColumn('dateEmailed', 'timestamp', col => col.defaultTo(null))
    .addColumn('dateAccountActivity', 'timestamp', col => col.defaultTo(null))
    .addColumn('dateAnalytics', 'timestamp', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema.dropTable(storedEventsTable).execute();
}
