import {Insertable} from "kysely";
import {MappedRecordType} from "Registration/Domain/Model/Mapping/MappedRecord";
import {
    NorthCapitalSynchronizationRecordType
} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";

export interface MappingRegistryTable {
    recordId: string;
    profileId: string;
    externalId: string;
    mappedType: MappedType;
    email: string | null;
    status: "DIRTY" | "CLEAN";
    version: number;
    createdDate: Date;
    updatedDate: Date;
    lockedUntil: Date | null;
}

export interface NorthCapitalSynchronizationTable {
    recordId: string;
    northCapitalId: string;
    type: "PARTY" | "ENTITY" | "ACCOUNT";
    crc: string;
    documents: string | null;
    version: number;
    createdDate: Date;
    updatedDate: Date;
    links: object | string;
}

export type InsertableMappingRegistry = Insertable<MappingRegistryTable>;
export type SelectableMappedRecord = Pick<MappingRegistryTable, keyof MappedRecordType>;

export type InsertableNorthCapitalSynchronization = Insertable<NorthCapitalSynchronizationTable>;
export type SelectableSynchronizationRecord = Pick<NorthCapitalSynchronizationTable, keyof NorthCapitalSynchronizationRecordType>;
export type SelectablePartyId = Pick<NorthCapitalSynchronizationTable, 'northCapitalId'>;