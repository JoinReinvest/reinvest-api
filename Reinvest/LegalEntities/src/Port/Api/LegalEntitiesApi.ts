import {CompletePersonInput, PeopleController, PersonType} from "LegalEntities/Port/Api/PeopleController";

export const LegalEntitiesApi = {
    completePerson: (input: CompletePersonInput, profileId: string, personType: PersonType) => [PeopleController.toString(), "completePerson"]
}
