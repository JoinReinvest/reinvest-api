import { ContainerInterface } from 'Container/Container';
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';
import { PdfController } from 'Documents/Port/Api/PdfController';

export type DocumentsApiType = {
  createAvatarFileLink: FileLinksController['createAvatarFileLink'];
  createDocumentsFileLinks: FileLinksController['createDocumentsFileLinks'];
  createImageFileLinks: FileLinksController['createImageFileLinks'];
  generatePdf: PdfController['generatePdf'];
  getAvatarLink: FileLinksController['getAvatarLink'];
  getDocumentLink: FileLinksController['getDocumentLink'];
  getImageLink: FileLinksController['getImageLink'];
};

export const DocumentsApi = (container: ContainerInterface): DocumentsApiType => ({
  generatePdf: container.delegateTo(PdfController, 'generatePdf'),
  createAvatarFileLink: container.delegateTo(FileLinksController, 'createAvatarFileLink'),
  createImageFileLinks: container.delegateTo(FileLinksController, 'createImageFileLinks'),
  createDocumentsFileLinks: container.delegateTo(FileLinksController, 'createDocumentsFileLinks'),
  getImageLink: container.delegateTo(FileLinksController, 'getImageLink'),
  getAvatarLink: container.delegateTo(FileLinksController, 'getAvatarLink'),
  getDocumentLink: container.delegateTo(FileLinksController, 'getDocumentLink'),
});
