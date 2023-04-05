export enum DomicileType {
    CITIZEN = "CITIZEN",
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