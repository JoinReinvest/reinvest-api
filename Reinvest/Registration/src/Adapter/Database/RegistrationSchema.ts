import {Insertable} from "kysely";
import {MappedRecordType} from "Registration/Domain/Model/Mapping/MappedRecord";
import {
    NorthCapitalEntityType,
    NorthCapitalSynchronizationRecordType
} from "Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord";
import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {
    VertaloEntityType, VertaloIds,
    VertaloSynchronizationRecordType
} from "Registration/Domain/VendorModel/Vertalo/VertaloTypes";

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
    type: NorthCapitalEntityType,
    crc: string;
    documents: string | null;
    version: number;
    createdDate: Date;
    updatedDate: Date;
    links: object | string;
}

export interface VertaloSynchronizationTable {
    recordId: string;
    vertaloIds: VertaloIds | string;
    type: VertaloEntityType,
    crc: string;
    documents: string | null;
    version: number;
    createdDate: Date;
    updatedDate: Date;
}

export type InsertableMappingRegistry = Insertable<MappingRegistryTable>;
export type SelectableMappedRecord = Pick<MappingRegistryTable, keyof MappedRecordType>;

export type InsertableNorthCapitalSynchronization = Insertable<NorthCapitalSynchronizationTable>;
export type SelectableNorthCapitalSynchronizationRecord = Pick<NorthCapitalSynchronizationTable, keyof NorthCapitalSynchronizationRecordType>;
export type SelectablePartyId = Pick<NorthCapitalSynchronizationTable, 'northCapitalId'>;

export type InsertableVertaloSynchronization = Insertable<VertaloSynchronizationTable>;
export type SelectableVertaloSynchronizationRecord = Pick<VertaloSynchronizationTable, keyof VertaloSynchronizationRecordType>;
