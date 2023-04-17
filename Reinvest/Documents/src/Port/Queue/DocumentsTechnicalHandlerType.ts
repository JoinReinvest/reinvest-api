import { ContainerInterface } from 'Container/Container';
import { AvatarRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/AvatarRemovedEventHandler';
import { DocumentRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/DocumentRemovedEventHandler';

export type DocumentsTechnicalHandlerType = {
  LegalEntityAvatarRemoved: AvatarRemovedEventHandler['handle'];
  LegalEntityDocumentRemoved: DocumentRemovedEventHandler['handle'];
};

export const documentsTechnicalHandler = (container: ContainerInterface): DocumentsTechnicalHandlerType => ({
  LegalEntityDocumentRemoved: container.delegateTo(DocumentRemovedEventHandler, 'handle'),
  LegalEntityAvatarRemoved: container.delegateTo(AvatarRemovedEventHandler, 'handle'),
});
