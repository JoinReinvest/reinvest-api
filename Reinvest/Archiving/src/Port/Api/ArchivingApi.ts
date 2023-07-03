import { ContainerInterface } from 'Container/Container';

export type ArchivingApiType = {
  // createAvatarFileLink: FileLinksController['createAvatarFileLink'];
};

export const ArchivingApi = (container: ContainerInterface): ArchivingApiType => ({
  // getRenderedPageLink: container.delegateTo(PdfController, 'getRenderedPageLink'),
});
