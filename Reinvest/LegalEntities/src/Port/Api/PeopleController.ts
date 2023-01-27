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
    dateOfBirth?: string,
    address?: {
        addressLine1: string
        addressLine2?: string
        city: string
        zip: string
        country: string
        state: string
    },
    idScan?: {
        id: string
    },
    avatar?: {
        id: string
    }
}

export class PeopleController {
    public static toString = () => "PeopleController";
    private peopleRepository: PeopleRepository;

    constructor(peopleRepository: PeopleRepository) {
        this.peopleRepository = peopleRepository;
    }

    public completePerson(input: CompletePersonInput, profileId: string, personType: PersonType) {
        console.log({input})
    }
}