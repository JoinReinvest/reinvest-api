import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";
import {DocumentSchema} from "Registration/Domain/Model/ReinvestTypes";

export enum NorthCapitalDomicile {
    "CITIZEN" = "U.S. Citizen",
    "RESIDENT" = "U.S. Resident",
    "NON_RESIDENT" = "non-resident"
}

export enum NorthCapitalEntityType {
    "REVOCABLE" = "Revocable Trust",
    "IRREVOCABLE" = "Irrevocable Trust",
    "PARTNERSHIP" = "Limited Partnership",
    "LLC" = "LLC",
    "CORPORATION" = "Corporation",
}

export enum NorthCapitalEmploymentStatus {
    EMPLOYED = "Employed",
    UNEMPLOYED = "Not Employed",
    RETIRED = "Retired",
    STUDENT = "Student",
}

export enum NorthCapitalObjectType {
    ACCOUNT = "ACCOUNT",
    PARTY = "PARTY",
    ENTITY = "ENTITY",
}

export type NorthCapitalPartyStructure = {
    domicile: NorthCapitalDomicile | null,
    firstName: string,
    middleInitial?: string,
    lastName: string,
    dob: string,
    primAddress1: string,
    primAddress2?: string,
    primCity: string,
    primState: string,
    primZip: string,
    primCountry: string,
    emailAddress: string,
    socialSecurityNumber: string | null,
}

export type NorthCapitalEntityStructure = {
    entityName: string,
    ein?: string | null,
    primAddress1: string,
    primAddress2?: string | null,
    primCity: string,
    primState: string,
    primZip: string,
    primCountry: string,
    emailAddress: string,
    entityType?: string | null,
}

export type NorthCapitalIndividualExtendedMainPartyStructure = {
    occupation?: string | null,
    empName?: string | null,
    empStatus?: NorthCapitalEmploymentStatus | null,
    householdNetworth?: string | null,
    currentHouseholdIncome?: string | null,
}

export type NorthCapitalIndividualAccountStructure = {
    accountRegistration: string,
    type: "Individual",
    streetAddress1: string,
    streetAddress2?: string,
    city: string,
    state: string,
    zip: string,
    country: string,
}

export type NorthCapitalCompanyAccountStructure = {
    accountRegistration: string,
    type: "Entity",
    entityType: NorthCapitalEntityType | null,
    streetAddress1: string,
    streetAddress2?: string,
    city: string,
    state: string,
    zip: string,
    country: string,
}

export type NorthCapitalLinkMappingConfiguration = {
    type: MappedType,
    profileId: string,
    externalId: string,
    thisIsAccountEntry?: boolean
}

export type NorthCapitalSynchronizationMapping = {
    mapping: NorthCapitalLinkMappingConfiguration,
    northCapitalId: string,
}

export type NorthCapitalLinkConfiguration = {
    relatedEntryType: "Account" | "IndivACParty" | "EntityACParty",
    linkType: "owner" | "manager" | "member" | "officer" | "director" | "spouse" | "beneficiary" | "trustee" | "custodian" | "parentco" | "subsidiary" | "other" | "acgroup" | "advisor" | "attorney" | "proxy"
    primary_value: 0 | 1, // is a main party
}

export type NorthCapitalLink = {
    mappingConfiguration: NorthCapitalLinkMappingConfiguration,
    linkConfiguration: NorthCapitalLinkConfiguration,
}

export type NorthCapitalIndividualAccountType = {
    profileId: string,
    extendedParty: NorthCapitalIndividualExtendedMainPartyStructure,
    account: NorthCapitalIndividualAccountStructure,
    links: NorthCapitalLink[]
}

export type NorthCapitalCompanyAccountType = {
    profileId: string,
    account: NorthCapitalCompanyAccountStructure,
    links: NorthCapitalLink[]
}

export type NorthCapitalCompanyEntityType = {
    profileId: string,
    entity: NorthCapitalEntityStructure,
    documents: DocumentSchema[],
    links: NorthCapitalLink[]
}

export type NorthCapitalMainPartyType = {
    party: NorthCapitalPartyStructure,
    documents: DocumentSchema[],
}

export type NorthCapitalCompanyStakeholderType = {
    profileId: string,
    party: NorthCapitalPartyStructure,
    documents: DocumentSchema[],
    links: NorthCapitalLink[]
}

export enum DocumentSyncState {
    DIRTY = 'DIRTY',
    CLEAN = 'CLEAN',
    FAILED = 'FAILED',
    TO_BE_DELETED = 'TO_BE_DELETED'
}

export type NorthCapitalDocumentToSync = {
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

export type NorthCapitalUploadedDocument = {
    documentTitle: string;
    documentId: string;
    documentFileReferenceCode: string;
    documentName: string;
    createdDate: string;
    url: string;
}
