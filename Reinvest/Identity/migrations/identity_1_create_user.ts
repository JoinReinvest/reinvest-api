import {Kysely, sql} from 'kysely';
import {IdentityDatabase} from "../src/Adapter/Database/DatabaseAdapter";

export async function up(db: Kysely<IdentityDatabase>): Promise<void> {
    await db.schema
        .createTable('identity_user')
        .addColumn('id', 'varchar(36)', col => col.primaryKey().notNull().unique())
        .addColumn('cognitoUserId', 'varchar(255)', col => col.notNull().unique())
        .addColumn('profileId', 'varchar(36)', col => col.notNull().unique())
        .addColumn('email', 'varchar(255)', col => col.notNull().unique())
        .addColumn('invitedByIncentiveToken', 'varchar(10)', col => col.defaultTo(sql`NULL`))
        .addColumn('userIncentiveToken', 'varchar(10)', col => col.unique())
        .addColumn('createdAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .execute();
}

export async function down(db: Kysely<IdentityDatabase>): Promise<void> {
    await db.schema.dropTable('identity_user').execute();
}
