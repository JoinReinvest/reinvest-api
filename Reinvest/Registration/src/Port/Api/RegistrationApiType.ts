import {ContainerInterface} from "Container/Container";
import {NorthCapitalDocumentSynchronizationQuery} from "Registration/Port/Api/DocumentSynchronizationQuery";

export type RegistrationApiType = {
    listDocumentsToSynchronize: NorthCapitalDocumentSynchronizationQuery['listDocumentsToSynchronize'];
}

export const registrationApi = (container: ContainerInterface): RegistrationApiType => ({
    listDocumentsToSynchronize: container.delegateTo(NorthCapitalDocumentSynchronizationQuery, 'listDocumentsToSynchronize')
});