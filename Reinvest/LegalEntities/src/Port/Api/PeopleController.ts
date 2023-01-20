import {Person} from "LegalEntities/Common/Model/ValueObject/Person";
import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";
import {InputParameters} from "LegalEntities/Port/Api/InputParameters";

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
    public completePerson(inputParameters: InputParameters) {
        console.log({completePersonController: this, input: inputParameters})
    }
}