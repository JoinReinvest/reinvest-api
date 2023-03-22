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

export type MainPartyType = {
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

export type IndividualAccountType = {
    profileId: string,
    extendedParty: {
        occupation: string | null,
        empName: string | null,
        empStatus: NorthCapitalEmploymentStatus | null,
        householdNetworth: string | null,
        currentHouseholdIncome: string | null,
    },
    account: {
        accountRegistration: string,
        type: "Individual",
        domesticYN: "domestic_account",
        streetAddress1: string,
        streetAddress2?: string,
        city: string,
        state: string,
        zip: string,
        country: string,
    },
}