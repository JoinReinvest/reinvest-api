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

export class ProfileController {
    public static getClassName = (): string => "ProfileController";
    private peopleRepository: PeopleRepository;

    constructor(peopleRepository: PeopleRepository) {
        this.peopleRepository = peopleRepository;
    }

    public completeProfile(input: CompletePersonInput, profileId: string, personType: PersonType) {
        console.log({input})
    }
}