export enum NorthCapitalDomicile {
    "CITIZEN" = "U.S. Citizen",
    "RESIDENT" = "U.S. Resident",
    "NON_RESIDENT" = "non-resident"
}

export type MainPartyType = {
    domicile: NorthCapitalDomicile,
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
    socialSecurityNumber: string,
    documents?: { id: string }[],
}