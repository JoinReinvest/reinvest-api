// @ts-nocheck
import {CompletePersonInput, PeopleController, PersonType} from "LegalEntities/Port/Api/PeopleController";
import {FileLink, FileLinksController} from "LegalEntities/Port/Api/FileLinksController";

export const LegalEntitiesApi = {
    completePerson: (input: CompletePersonInput, profileId: string, personType: PersonType): void => [PeopleController.toString(), "completePerson"],
    createAvatarFileLink: (profileId: string): FileLink[] => [FileLinksController.toString(), "createAvatarFileLink"],
    createDocumentsFileLinks: (numberOfLinks: number, profileId: string): FileLink[] => [FileLinksController.toString(), "createDocumentsFileLinks"],
}
