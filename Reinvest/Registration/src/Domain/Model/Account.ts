import {Address, EmploymentStatusType} from "Registration/Domain/Model/ReinvestTypes";

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
