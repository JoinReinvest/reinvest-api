import {PeopleController} from "LegalEntities/Port/Api/PeopleController";
import {FileLinksController} from "LegalEntities/Port/Api/FileLinksController";
import {ContainerInterface} from "Container/Container";

export type LegalEntitiesApiType = {
    completePerson: PeopleController["completePerson"],
    createAvatarFileLink: FileLinksController["createAvatarFileLink"],
    createDocumentsFileLinks: FileLinksController["createDocumentsFileLinks"],
}

export const LegalEntitiesApi = (container: ContainerInterface): LegalEntitiesApiType => ({
    completePerson: container.delegateTo(PeopleController, 'completePerson'),
    createAvatarFileLink: container.delegateTo(FileLinksController, 'createAvatarFileLink'),
    createDocumentsFileLinks: container.delegateTo(FileLinksController, 'createDocumentsFileLinks'),
})
