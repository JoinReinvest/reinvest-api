import {
    AccountType,
    Address,
    CompanyType,
    DocumentSchema, DomicileType,
    EmploymentStatusType
} from "Registration/Domain/Model/ReinvestTypes";


export type AccountNameOwner = {
    firstName: string
    middleName?: string
    lastName: string,
}

export type IndividualAccountForSynchronization = {
    accountId: string,
    profileId: string,
    employmentStatus?: EmploymentStatusType,
    name: {
        firstName: string
        middleName?: string
        lastName: string,
    },
    address: Address,
    nameOfEmployer?: string,
    title?: string,
    industry?: string,
    netWorth?: string,
    netIncome?: string,
}


export type StakeholderForSynchronization = {
    accountId: string,
    profileId: string,
    id: string,
    ssn: string | null;
    name: {
        firstName: string
        middleName?: string
        lastName: string,
    }
    dateOfBirth: string;
    address: Address,
    domicile: DomicileType,
    idScan: DocumentSchema[],
    accountType: AccountType,
}

export type CompanyForSynchronization = {
    profileId: string;
    accountId: string;
    ein: string | null,
    companyDocuments: DocumentSchema[],
    accountType: AccountType
    address: Address,
    companyName: {
        name: string,
    },
    companyType: { type: CompanyType },
}

export type CompanyAccountForSynchronization = {
    accountId: string,
    profileId: string,
    ownerName: {
        firstName: string
        middleName?: string
        lastName: string,
    },
    address: Address,
    companyType: { type: CompanyType },
    stakeholders: { id: string }[],
}
