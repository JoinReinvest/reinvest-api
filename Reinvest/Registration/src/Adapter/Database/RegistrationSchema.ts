import { JSONObjectOf } from 'HKEKTypes/Generics';
import { Insertable } from 'kysely';
import { NorthCapitalEntityType, NorthCapitalSynchronizationRecordType } from 'Registration/Adapter/NorthCapital/NorthCapitalSynchronizationRecord';
import { PlaidResult } from 'Registration/Domain/Model/BankAccount';
import { MappedRecordType } from 'Registration/Domain/Model/Mapping/MappedRecord';
import { MappedRecordStatus, MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { DocumentSyncState, NorthCapitalObjectType } from 'Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes';
import { VertaloEntityType, VertaloIds, VertaloSynchronizationRecordType } from 'Registration/Domain/VendorModel/Vertalo/VertaloTypes';

export interface MappingRegistryTable {
  createdDate: Date;
  dependentId: string | null;
  email: string | null;
  externalId: string;
  lockedUntil: Date | null;
  mappedType: MappedType;
  profileId: string;
  recordId: string;
  status: MappedRecordStatus;
  updatedDate: Date;
  version: number;
}

export interface NorthCapitalSynchronizationTable {
  crc: string;
  createdDate: Date;
  links: object | string;
  northCapitalId: string;
  recordId: string;
  type: NorthCapitalEntityType;
  updatedDate: Date;
  version: number;
}

export interface NorthCapitalDocumentsSynchronizationTable {
  createdDate: Date;
  documentFilename: string;
  documentId: string;
  documentPath: string;
  northCapitalId: string;
  northCapitalType: NorthCapitalObjectType;
  recordId: string;
  state: DocumentSyncState;
  updatedDate: Date;
  version: number;
}

export interface VertaloSynchronizationTable {
  crc: string;
  createdDate: Date;
  documents: string | null;
  recordId: string;
  type: VertaloEntityType;
  updatedDate: Date;
  version: number;
  vertaloIds: VertaloIds | string;
}

export interface RegistrationBankAccountTable {
  accountId: string;
  bankAccountId: string;
  bankAccountNumber: string | null;
  bankAccountType: string | null;
  northCapitalId: string;
  plaidJson: JSONObjectOf<PlaidResult>;
  plaidUrl: string | null;
  profileId: string;
  state: 'ACTIVE' | 'INACTIVE' | 'IN_PROGRESS';
  createdDate?: Date;
}

export type InsertableMappingRegistry = Insertable<MappingRegistryTable>;
export type SelectableMappedRecord = Pick<MappingRegistryTable, keyof MappedRecordType>;

export type InsertableNorthCapitalSynchronization = Insertable<NorthCapitalSynchronizationTable>;
export type SelectableNorthCapitalSynchronizationRecord = Pick<NorthCapitalSynchronizationTable, keyof NorthCapitalSynchronizationRecordType>;
export type SelectablePartyId = Pick<NorthCapitalSynchronizationTable, 'northCapitalId'>;

export type InsertableVertaloSynchronization = Insertable<VertaloSynchronizationTable>;
export type SelectableVertaloSynchronizationRecord = Pick<VertaloSynchronizationTable, keyof VertaloSynchronizationRecordType>;

export type InsertableNorthCapitalDocumentsSynchronization = Insertable<NorthCapitalDocumentsSynchronizationTable>;
