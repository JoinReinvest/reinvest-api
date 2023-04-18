export enum DomicileType {
    CITIZEN = "CITIZEN",
    RESIDENT = "RESIDENT",
    GREEN_CARD = "GREEN_CARD",
    VISA = "VISA",
}

export enum EmploymentStatusType {
    EMPLOYED = "EMPLOYED",
    UNEMPLOYED = "UNEMPLOYED",
    RETIRED = "RETIRED",
    STUDENT = "STUDENT",
}

export type Address = {
    addressLine1: string
    addressLine2?: string
    city: string
    zip: string
    country: string
    state: string
};

export type DocumentSchema = {
    id: string,
    path: string,
    fileName: string,
}

export enum AccountType {
    CORPORATE = "CORPORATE",
    TRUST = "TRUST",
}

export enum CompanyType {
    PARTNERSHIP = 'PARTNERSHIP',
    LLC = 'LLC',
    CORPORATION = 'CORPORATION',
    REVOCABLE = 'REVOCABLE',
    IRREVOCABLE = 'IRREVOCABLE'
}

