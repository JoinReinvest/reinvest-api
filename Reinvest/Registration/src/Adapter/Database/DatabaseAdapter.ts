import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {Kysely} from "kysely";
import {
    MappingRegistryTable,
    NorthCapitalSynchronizationTable,
    VertaloSynchronizationTable
} from "Registration/Adapter/Database/RegistrationSchema";

export const registrationMappingRegistryTable = "registration_mapping_registry";
export const northCapitalSynchronizationTable = "registration_north_capital_synchronization";
export const vertaloSynchronizationTable = "registration_vertalo_synchronization";

export interface RegistrationDatabase {
    [registrationMappingRegistryTable]: MappingRegistryTable,
    [northCapitalSynchronizationTable]: NorthCapitalSynchronizationTable,
    [vertaloSynchronizationTable]: VertaloSynchronizationTable,
}

export const RegistrationDatabaseAdapterInstanceProvider = "RegistrationDatabaseAdapterProvider";
export type RegistrationDatabaseAdapter = Kysely<RegistrationDatabase>;
export type RegistrationDatabaseAdapterProvider = DatabaseProvider<RegistrationDatabase>;

export function createRegistrationDatabaseAdapterProvider(config: PostgreSQLConfig): RegistrationDatabaseAdapterProvider {
    return new DatabaseProvider<RegistrationDatabase>(config);
}