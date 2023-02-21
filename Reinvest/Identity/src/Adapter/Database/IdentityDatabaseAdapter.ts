import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {Kysely} from "kysely/dist/esm";
import {IdentityPhoneVerification, IdentityUser} from "Identity/Adapter/Database/IdentitySchema";
import {Selectable, Updateable} from "kysely";

export const userTable = 'identity_user';
export const phoneVerificationTable = 'identity_phone_verification';

export interface IdentityDatabase {
    [userTable]: IdentityUser,
    [phoneVerificationTable]: IdentityPhoneVerification
}

export const DatabaseAdapterProvider = "IdentityDatabaseAdapterProvider";
export type IdentityDatabaseAdapter = Kysely<IdentityDatabase>;
export type IdentityDatabaseAdapterProvider = DatabaseProvider<IdentityDatabase>;

export function createIdentityDatabaseAdapterProvider(config: PostgreSQLConfig): DatabaseProvider<IdentityDatabase> {
    return new DatabaseProvider<IdentityDatabase>(config);
}

export type PhoneCodeRow = Pick<SelectablePhoneCode,
    'topt' | 'tries' | 'createdAt' | 'expiresAfterMinutes'> & {
    topt: string | null;
    tries: number | null;
    createdAt: Date | null;
    expiresAfterMinutes: number | null;
};

export type SelectablePhoneCode = Selectable<IdentityPhoneVerification>;
export type UpdateablePhoneCodeRow = Updateable<PhoneCodeRow>;