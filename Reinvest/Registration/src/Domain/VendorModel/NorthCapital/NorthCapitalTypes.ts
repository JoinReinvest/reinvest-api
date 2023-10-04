import { MappedType } from 'Registration/Domain/Model/Mapping/MappedType';
import { DocumentSchema } from 'Registration/Domain/Model/ReinvestTypes';

export enum NorthCapitalDomicile {
  'CITIZEN' = 'U.S. Citizen',
  'RESIDENT' = 'U.S. Resident',
  'NON_RESIDENT' = 'non-resident',
}

export enum NorthCapitalEntityType {
  'REVOCABLE' = 'Revocable Trust',
  'IRREVOCABLE' = 'Irrevocable Trust',
  'PARTNERSHIP' = 'Limited Partnership',
  'LLC' = 'LLC',
  'CORPORATION' = 'Corporation',
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

export type NorthCapitalPartyStructure = {
  dob: string;
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

export type NorthCapitalEntityStructure = {
  emailAddress: string;
  entityName: string;
  primAddress1: string;
  primCity: string;
  primCountry: string;
  primState: string;
  primZip: string;
  ein?: string | null;
  entityType?: string | null;
  primAddress2?: string | null;
};

export type NorthCapitalIndividualExtendedMainPartyStructure = {
  currentHouseholdIncome?: string | null;
  empName?: string | null;
  empStatus?: NorthCapitalEmploymentStatus | null;
  householdNetworth?: string | null;
  occupation?: string | null;
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
  email?: string;
  phoneNumber?: number;
};

export type NorthCapitalCompanyAccountStructure = {
  accountRegistration: string;
  city: string;
  country: string;
  entityType: NorthCapitalEntityType | null;
  state: string;
  streetAddress1: string;
  type: 'Entity';
  zip: string;
  streetAddress2?: string;
};

export type NorthCapitalLinkMappingConfiguration = {
  externalId: string;
  profileId: string;
  type: MappedType;
  thisIsAccountEntry?: boolean;
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
  extendedParty: NorthCapitalIndividualExtendedMainPartyStructure;
  links: NorthCapitalLink[];
  profileId: string;
};

export type NorthCapitalCompanyAccountType = {
  account: NorthCapitalCompanyAccountStructure;
  links: NorthCapitalLink[];
  profileId: string;
};

export type NorthCapitalCompanyEntityType = {
  documents: DocumentSchema[];
  entity: NorthCapitalEntityStructure;
  links: NorthCapitalLink[];
  profileId: string;
};

export type NorthCapitalMainPartyType = {
  documents: DocumentSchema[];
  party: NorthCapitalPartyStructure;
};

export type NorthCapitalCompanyStakeholderType = {
  documents: DocumentSchema[];
  links: NorthCapitalLink[];
  party: NorthCapitalPartyStructure;
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
