import {MappedType} from "Registration/Domain/Model/Mapping/MappedType";

export enum NorthCapitalDomicile {
    "CITIZEN" = "U.S. Citizen",
    "RESIDENT" = "U.S. Resident",
    "NON_RESIDENT" = "non-resident"
}

export enum NorthCapitalEmploymentStatus {
    EMPLOYED = "Employed",
    UNEMPLOYED = "Not Employed",
    RETIRED = "Retired",
    STUDENT = "Student",
}

export type NorthCapitalMainPartyType = {
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
    documents?: { id: string }[],
}

export type NorthCapitalIndividualExtendedMainPartyType = {
    occupation: string | null,
    empName: string | null,
    empStatus: NorthCapitalEmploymentStatus | null,
    householdNetworth: string | null,
    currentHouseholdIncome: string | null,
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

export type NorthCapitalLinkMappingConfiguration = {
    type: MappedType,
    profileId: string,
    externalId: string,
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
    extendedParty: NorthCapitalIndividualExtendedMainPartyType,
    account: NorthCapitalIndividualAccountStructure,
    links: NorthCapitalLink[]
}
