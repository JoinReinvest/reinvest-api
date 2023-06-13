import { ContainerInterface } from 'Container/Container';
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';

export type DocumentsApiType = {
  createAvatarFileLink: FileLinksController['createAvatarFileLink'];
  createDocumentsFileLinks: FileLinksController['createDocumentsFileLinks'];
  getAvatarLink: FileLinksController['getAvatarLink'];
  getDocumentLink: FileLinksController['getDocumentLink'];
};

export const DocumentsApi = (container: ContainerInterface): DocumentsApiType => ({
  createAvatarFileLink: container.delegateTo(FileLinksController, 'createAvatarFileLink'),
  createDocumentsFileLinks: container.delegateTo(FileLinksController, 'createDocumentsFileLinks'),
  getAvatarLink: container.delegateTo(FileLinksController, 'getAvatarLink'),
  getDocumentLink: container.delegateTo(FileLinksController, 'getDocumentLink'),
});
