import { ContainerInterface } from 'Container/Container';
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';
import { SigningController } from 'Documents/Port/Api/SigningController';
import { TemplatesController } from 'Documents/Port/Api/TemplatesController';

export type DocumentsApiType = {
  createAvatarFileLink: FileLinksController['createAvatarFileLink'];
  createDocumentsFileLinks: FileLinksController['createDocumentsFileLinks'];
  getAvatarLink: FileLinksController['getAvatarLink'];
  getDocumentLink: FileLinksController['getDocumentLink'];
  getTemplate: TemplatesController['getTemplate'];
  signDocumentFromTemplate: SigningController['signDocumentFromTemplate'];
};

export const DocumentsApi = (container: ContainerInterface): DocumentsApiType => ({
  createAvatarFileLink: container.delegateTo(FileLinksController, 'createAvatarFileLink'),
  createDocumentsFileLinks: container.delegateTo(FileLinksController, 'createDocumentsFileLinks'),
  getAvatarLink: container.delegateTo(FileLinksController, 'getAvatarLink'),
  getDocumentLink: container.delegateTo(FileLinksController, 'getDocumentLink'),
  signDocumentFromTemplate: container.delegateTo(SigningController, 'signDocumentFromTemplate'),
  getTemplate: container.delegateTo(TemplatesController, 'getTemplate'),
});
