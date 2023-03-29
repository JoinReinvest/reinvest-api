import {Address, DocumentSchema, DomicileType} from "Registration/Domain/Model/ReinvestTypes";

export type ProfileForSynchronization = {
    firstName: string,
    middleName?: string,
    lastName: string,
    dateOfBirth: string,
    experience: string,
    domicile: DomicileType,
    ssn: string | null,
    address: Address,
    idScan: DocumentSchema[]
}
