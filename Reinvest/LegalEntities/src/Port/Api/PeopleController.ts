import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";


enum PersonType {
    Individual = "Individual",
    Stakeholder = "Stakeholder"
}

export class PeopleController {
    public static toString = () => "PeopleController";
    private peopleRepository: PeopleRepository;

    constructor(peopleRepository: PeopleRepository) {
        this.peopleRepository = peopleRepository;
    }
// personType: PersonType, person: Person
    public completePerson(firstName: string, lastName: string) {
        console.log({completePersonController: this, input: [...arguments]})
    }
}