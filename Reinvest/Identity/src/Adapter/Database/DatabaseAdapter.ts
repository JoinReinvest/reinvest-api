import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {Kysely} from "kysely/dist/esm";
import {IdentityUser} from "Identity/Adapter/Database/IdentitySchema";

export const userTable = 'identity_user';

export interface IdentityDatabase {
    [userTable]: IdentityUser,
}

export const DatabaseAdapterProvider = "IdentityDatabaseAdapterProvider";
export type DatabaseAdapter = Kysely<IdentityDatabase>;
export type DatabaseAdapterProvider = DatabaseProvider<IdentityDatabase>;

export function createIdentityDatabaseAdapterProvider(config: PostgreSQLConfig): DatabaseProvider<IdentityDatabase> {
    return new DatabaseProvider<IdentityDatabase>(config);
}