import {ContainerInterface} from "Container/Container";
import {
    NorthCapitalDocumentSynchronizationController
} from "Registration/Port/Api/NorthCapitalDocumentSynchronizationController";
import {NorthCapitalDocumentSynchronizationQuery} from "./NorthCapitalDocumentSynchronizationQuery";

export type RegistrationApiType = {
    listDocumentsToSynchronize: NorthCapitalDocumentSynchronizationQuery['listDocumentsToSynchronize'],
    synchronizeDocument: NorthCapitalDocumentSynchronizationController['synchronizeDocument'],
}

export const registrationApi = (container: ContainerInterface): RegistrationApiType => ({
    listDocumentsToSynchronize: container.delegateTo(NorthCapitalDocumentSynchronizationQuery, 'listDocumentsToSynchronize'),
    synchronizeDocument: container.delegateTo(NorthCapitalDocumentSynchronizationController, 'synchronizeDocument')
});