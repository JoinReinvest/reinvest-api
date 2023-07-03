import { ContainerInterface } from 'Container/Container';
import { FileLinkService } from 'Documents/Adapter/S3/FileLinkService';
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { Documents } from 'Documents/index';
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';
import { PdfController } from 'Documents/Port/Api/PdfController';
import { AvatarRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/AvatarRemovedEventHandler';
import { DocumentRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/DocumentRemovedEventHandler';
import GetRenderedPageLink from 'Documents/UseCases/GetRenderedPageLink';
import ListRenderedPage from 'Documents/UseCases/ListRenderedPage';
import RenderPageToPdf from 'Documents/UseCases/RenderPageToPdf';

export class PortsProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    //controllers
    container
      .addSingleton(FileLinksController, [FileLinkService])
      .addSingleton(PdfController, [RenderPageToPdf, GetRenderedPageLink, ListRenderedPage])
      .addSingleton(FileLinksController, [FileLinkService]);

    // queue
    container.addSingleton(DocumentRemovedEventHandler, [S3Adapter]).addSingleton(AvatarRemovedEventHandler, [S3Adapter]);
  }
}
