import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { DocumentSchema } from 'Registration/Domain/Model/ReinvestTypes';

export enum NorthCapitalDomicile {
  'CITIZEN' = 'U.S. Citizen',
  'RESIDENT' = 'U.S. Resident',
  'NON_RESIDENT' = 'non-resident',
}

export enum NorthCapitalEmploymentStatus {
  EMPLOYED = 'Employed',
  UNEMPLOYED = 'Not Employed',
  RETIRED = 'Retired',
  STUDENT = 'Student',
}

export enum NorthCapitalObjectType {
  ACCOUNT = 'ACCOUNT',
  PARTY = 'PARTY',
  ENTITY = 'ENTITY',
}

export type NorthCapitalMainPartyType = {
  dob: string;
  documents: DocumentSchema[];
  domicile: NorthCapitalDomicile | null;
  emailAddress: string;
  firstName: string;
  lastName: string;
  primAddress1: string;
  primCity: string;
  primCountry: string;
  primState: string;
  primZip: string;
  socialSecurityNumber: string | null;
  middleInitial?: string;
  primAddress2?: string;
};

export type NorthCapitalIndividualExtendedMainPartyType = {
  currentHouseholdIncome: string | null;
  empName: string | null;
  empStatus: NorthCapitalEmploymentStatus | null;
  householdNetworth: string | null;
  occupation: string | null;
};

export type NorthCapitalIndividualAccountStructure = {
  accountRegistration: string;
  city: string;
  country: string;
  state: string;
  streetAddress1: string;
  type: 'Individual';
  zip: string;
  streetAddress2?: string;
};

export type NorthCapitalLinkMappingConfiguration = {
  externalId: string;
  profileId: string;
  type: MappedType;
};

export type NorthCapitalSynchronizationMapping = {
  mapping: NorthCapitalLinkMappingConfiguration;
  northCapitalId: string;
};

export type NorthCapitalLinkConfiguration = {
  linkType:
    | 'owner'
    | 'manager'
    | 'member'
    | 'officer'
    | 'director'
    | 'spouse'
    | 'beneficiary'
    | 'trustee'
    | 'custodian'
    | 'parentco'
    | 'subsidiary'
    | 'other'
    | 'acgroup'
    | 'advisor'
    | 'attorney'
    | 'proxy';
  primary_value: 0 | 1;
  relatedEntryType: 'Account' | 'IndivACParty' | 'EntityACParty'; // is a main party
};

export type NorthCapitalLink = {
  linkConfiguration: NorthCapitalLinkConfiguration;
  mappingConfiguration: NorthCapitalLinkMappingConfiguration;
};

export type NorthCapitalIndividualAccountType = {
  account: NorthCapitalIndividualAccountStructure;
  extendedParty: NorthCapitalIndividualExtendedMainPartyType;
  links: NorthCapitalLink[];
  profileId: string;
};

export enum DocumentSyncState {
  DIRTY = 'DIRTY',
  CLEAN = 'CLEAN',
  FAILED = 'FAILED',
  TO_BE_DELETED = 'TO_BE_DELETED',
}

export type NorthCapitalDocumentToSync = {
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
};

export type NorthCapitalUploadedDocument = {
  createdDate: string;
  documentFileReferenceCode: string;
  documentId: string;
  documentName: string;
  documentTitle: string;
  url: string;
};
