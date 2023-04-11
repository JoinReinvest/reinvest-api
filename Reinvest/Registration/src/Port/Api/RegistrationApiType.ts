import {ContainerInterface} from "Container/Container";
import {
    NorthCapitalDocumentSynchronizationController
} from "Registration/Port/Api/NorthCapitalDocumentSynchronizationController";
import {NorthCapitalDocumentSynchronizationQuery} from "./NorthCapitalDocumentSynchronizationQuery";
import {SynchronizationQuery} from "Registration/Port/Api/SynchronizationQuery";
import {SynchronizationController} from "Registration/Port/Api/SynchronizationController";

export type RegistrationApiType = {
    listDocumentsToSynchronize: NorthCapitalDocumentSynchronizationQuery['listDocumentsToSynchronize'],
    synchronizeDocument: NorthCapitalDocumentSynchronizationController['synchronizeDocument'],
    listObjectsToSync: SynchronizationQuery['listObjectsToSync'],
    synchronize: SynchronizationController['synchronize'],
}

export const registrationApi = (container: ContainerInterface): RegistrationApiType => ({
    listDocumentsToSynchronize: container.delegateTo(NorthCapitalDocumentSynchronizationQuery, 'listDocumentsToSynchronize'),
    synchronizeDocument: container.delegateTo(NorthCapitalDocumentSynchronizationController, 'synchronizeDocument'),
    listObjectsToSync: container.delegateTo(SynchronizationQuery, 'listObjectsToSync'),
    synchronize: container.delegateTo(SynchronizationController, 'synchronize'),
});