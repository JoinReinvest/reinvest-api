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
import {
    DocumentSyncState,
    NorthCapitalObjectType
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";

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

export interface NorthCapitalDocumentsSynchronizationTable {
    recordId: string;
    northCapitalId: string;
    northCapitalType: NorthCapitalObjectType
    documentId: string;
    documentPath: string;
    documentFilename: string;
    version: number;
    state: DocumentSyncState;
    createdDate: Date;
    updatedDate: Date;
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

export type InsertableNorthCapitalDocumentsSynchronization = Insertable<NorthCapitalDocumentsSynchronizationTable>;
