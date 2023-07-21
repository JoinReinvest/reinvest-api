import { ContainerInterface } from 'Container/Container';
import { CalculationsController } from 'Documents/Port/Api/CalculationsController';
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';
import { PdfController } from 'Documents/Port/Api/PdfController';

export type DocumentsApiType = {
  addCalculation: CalculationsController['add'];
  createAvatarFileLink: FileLinksController['createAvatarFileLink'];
  createDocumentsFileLinks: FileLinksController['createDocumentsFileLinks'];
  createImageFileLinks: FileLinksController['createImageFileLinks'];
  generatePdf: PdfController['generatePdf'];
  getAdminDocumentLink: FileLinksController['getAdminDocumentLink'];
  getAvatarLink: FileLinksController['getAvatarLink'];
  getCalculation: CalculationsController['get'];
  getDocumentLink: FileLinksController['getDocumentLink'];
  getImageLink: FileLinksController['getImageLink'];
  getRenderedPageLink: PdfController['getRenderedPageLink'];
  listRenderedPages: PdfController['listRenderedPages'];
  renderPageToPdf: PdfController['renderPageToPdf'];
};

export const DocumentsApi = (container: ContainerInterface): DocumentsApiType => ({
  getRenderedPageLink: container.delegateTo(PdfController, 'getRenderedPageLink'),
  generatePdf: container.delegateTo(PdfController, 'generatePdf'),
  listRenderedPages: container.delegateTo(PdfController, 'listRenderedPages'),
  renderPageToPdf: container.delegateTo(PdfController, 'renderPageToPdf'),
  createAvatarFileLink: container.delegateTo(FileLinksController, 'createAvatarFileLink'),
  createImageFileLinks: container.delegateTo(FileLinksController, 'createImageFileLinks'),
  createDocumentsFileLinks: container.delegateTo(FileLinksController, 'createDocumentsFileLinks'),
  getImageLink: container.delegateTo(FileLinksController, 'getImageLink'),
  getAvatarLink: container.delegateTo(FileLinksController, 'getAvatarLink'),
  getDocumentLink: container.delegateTo(FileLinksController, 'getDocumentLink'),
  getAdminDocumentLink: container.delegateTo(FileLinksController, 'getAdminDocumentLink'),
  addCalculation: container.delegateTo(CalculationsController, 'add'),
  getCalculation: container.delegateTo(CalculationsController, 'get'),
});
