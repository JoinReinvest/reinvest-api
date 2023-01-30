import {FileLinksController} from "Documents/Port/Api/FileLinksController";
import {ContainerInterface} from "Container/Container";
import {SigningController} from "Documents/Port/Api/SigningController";
import {TemplatesController} from "Documents/Port/Api/TemplatesController";

export type DocumentsApiType = {
    createAvatarFileLink: FileLinksController["createAvatarFileLink"],
    createDocumentsFileLinks: FileLinksController["createDocumentsFileLinks"],
    signDocumentFromTemplate: SigningController["signDocumentFromTemplate"],
    getTemplate: TemplatesController["getTemplate"],
}

export const DocumentsApi = (container: ContainerInterface): DocumentsApiType => ({
    createAvatarFileLink: container.delegateTo(FileLinksController, 'createAvatarFileLink'),
    createDocumentsFileLinks: container.delegateTo(FileLinksController, 'createDocumentsFileLinks'),
    signDocumentFromTemplate: container.delegateTo(SigningController, 'signDocumentFromTemplate'),
    getTemplate: container.delegateTo(TemplatesController, 'getTemplate'),
})
