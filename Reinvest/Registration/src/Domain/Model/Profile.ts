import {Address, DomicileType} from "Registration/Domain/Model/SharedTypes";

export type ProfileForSynchronization = {
    firstName: string,
    middleName?: string,
    lastName: string,
    dateOfBirth: string,
    experience: string,
    domicile: DomicileType,
    ssn: string | null,
    address: Address,
    idScan?: { id: string }[],
}
