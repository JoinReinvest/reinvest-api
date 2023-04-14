import {ContainerInterface} from "Container/Container";
import {DocumentRemovedEventHandler} from "Documents/Port/Queue/EventHandler/DocumentRemovedEventHandler";
import {AvatarRemovedEventHandler} from "Documents/Port/Queue/EventHandler/AvatarRemovedEventHandler";

export type DocumentsTechnicalHandlerType = {
    LegalEntityDocumentRemoved: DocumentRemovedEventHandler['handle'],
    LegalEntityAvatarRemoved: AvatarRemovedEventHandler['handle'],
}

export const documentsTechnicalHandler = (container: ContainerInterface): DocumentsTechnicalHandlerType => ({
    LegalEntityDocumentRemoved: container.delegateTo(DocumentRemovedEventHandler, 'handle'),
    LegalEntityAvatarRemoved: container.delegateTo(AvatarRemovedEventHandler, 'handle'),
})
