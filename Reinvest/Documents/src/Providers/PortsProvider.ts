import { ContainerInterface } from 'Container/Container';
import { FileLinkService } from 'Documents/Adapter/S3/FileLinkService';
import { PdfService } from 'Documents/Adapter/S3/PdfService';
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { Documents } from 'Documents/index';
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';
import { PdfController } from 'Documents/Port/Api/PdfController';
import { SigningController } from 'Documents/Port/Api/SigningController';
import { TemplatesController } from 'Documents/Port/Api/TemplatesController';
import { AvatarRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/AvatarRemovedEventHandler';
import { DocumentRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/DocumentRemovedEventHandler';

export class PortsProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    //controllers
    container
      .addSingleton(FileLinksController, [FileLinkService])
      .addSingleton(TemplatesController)
      .addSingleton(SigningController)
      .addSingleton(PdfController, [PdfService]);

    // queue
    container.addSingleton(DocumentRemovedEventHandler, [S3Adapter]).addSingleton(AvatarRemovedEventHandler, [S3Adapter]);
  }
}
