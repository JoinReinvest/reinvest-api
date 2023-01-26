import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";


export enum PersonType {
    Individual = "Individual",
    Stakeholder = "Stakeholder"
}

export type CompletePersonInput = {
    name?: {
        firstName: string
        middleName?: string
        lastName: string,
    },
    dateOfBirth?: Date,
    address?: {
        addressLine1: string
        addressLine2?: string
        city: string
        zip: string
        country: string
        state: string
    },
    idScanFileLink?: {
        url: string
    }
}

export class PeopleController {
    public static toString = () => "PeopleController";
    private peopleRepository: PeopleRepository;

    constructor(peopleRepository: PeopleRepository) {
        this.peopleRepository = peopleRepository;
    }

// personType: PersonType, person: Person
    public completePerson(input: CompletePersonInput, profileId: string, personType: PersonType) {
        console.log({input})
    }
}