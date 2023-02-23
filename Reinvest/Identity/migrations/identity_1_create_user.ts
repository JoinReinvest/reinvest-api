import {Kysely, sql} from 'kysely';
import {IdentityDatabase, userTable} from "Identity/Adapter/Database/IdentityDatabaseAdapter";

export async function up(db: Kysely<IdentityDatabase>): Promise<void> {
    await db.schema
        .createTable(userTable)
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('cognitoUserId', 'uuid', col => col.notNull().unique())
        .addColumn('profileId', 'uuid', col => col.notNull().unique())
        .addColumn('email', 'varchar(255)', col => col.notNull().unique())
        .addColumn('invitedByIncentiveToken', 'varchar(10)', col => col.defaultTo(sql`NULL`))
        .addColumn('userIncentiveToken', 'varchar(10)', col => col.unique())
        .addColumn('createdAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .execute();
}

export async function down(db: Kysely<IdentityDatabase>): Promise<void> {
    await db.schema.dropTable(userTable).execute();
}
