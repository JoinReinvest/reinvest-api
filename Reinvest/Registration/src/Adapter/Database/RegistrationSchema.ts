import {Insertable, Selectable} from "kysely";
import {MappedRecordType} from "Registration/Domain/Model/Mapping/MappedRecord";

export interface MappingRegistryTable {
    recordId: string;
    profileId: string;
    externalId: string;
    mappedType: string;
    email: string | null;
    status: "DIRTY" | "CLEAN";
    version: number;
    createdDate: Date;
    updatedDate: Date;
    lockedUntil: Date | null;
}

export type InsertableMappingRegistry = Insertable<MappingRegistryTable>;
export type MappingRegistryInsert = Pick<InsertableMappingRegistry, 'recordId' | 'profileId' | 'externalId' | 'mappedType' | 'email'>;

export type SelectableMappingRegistry = Selectable<MappingRegistryTable>;
export type SelectableMappedRecord = Pick<MappingRegistryTable, keyof MappedRecordType>;