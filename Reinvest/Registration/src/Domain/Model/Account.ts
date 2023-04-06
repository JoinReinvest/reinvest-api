import {
    AccountType,
    Address,
    CompanyType,
    DocumentSchema, DomicileType,
    EmploymentStatusType
} from "Registration/Domain/Model/ReinvestTypes";


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
}

export type CompanyForSynchronization = {
    ein: string | null,
    companyDocuments: DocumentSchema[],
    accountType: AccountType
    address: Address,
    companyName: {
        name: string,
    },
    companyType: CompanyType,

}

export type CompanyAccountForSynchronization = {
    accountId: string,
    profileId: string,
    ownerName: {
        firstName: string
        middleName?: string
        lastName: string,
    }
    address: Address,
    companyType: CompanyType,
    stakeholders: { id: string }[],
}
