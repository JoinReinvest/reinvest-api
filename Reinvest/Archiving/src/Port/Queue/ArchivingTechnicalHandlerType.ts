import { ContainerInterface } from 'Container/Container';

export type ArchivingTechnicalHandlerType = {
  // LegalEntityAvatarRemoved: AvatarRemovedEventHandler['handle'];
};

export const archivingTechnicalHandler = (container: ContainerInterface): ArchivingTechnicalHandlerType => ({
  // LegalEntityDocumentRemoved: container.delegateTo(DocumentRemovedEventHandler, 'handle'),
});
