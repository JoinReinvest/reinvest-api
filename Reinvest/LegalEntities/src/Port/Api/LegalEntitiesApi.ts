import {PeopleController} from "LegalEntities/Port/Api/PeopleController";

export const LegalEntitiesApi = {
    completePerson: (firstName: string, lastName: string) => [PeopleController.toString(), "completePerson"]
}
