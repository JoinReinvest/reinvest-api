import { ContainerInterface } from 'Container/Container';
import { FileLinkService } from 'Documents/Adapter/S3/FileLinkService';
import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { Documents } from 'Documents/index';
import { CalculationsController } from 'Documents/Port/Api/CalculationsController'
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';
import { PdfController } from 'Documents/Port/Api/PdfController';
import { AvatarRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/AvatarRemovedEventHandler';
import { DocumentRemovedEventHandler } from 'Documents/Port/Queue/EventHandler/DocumentRemovedEventHandler';
import AddCalculation from 'Documents/UseCases/AddCalculation'
import GetCalculation from 'Documents/UseCases/GetCalculation'
import GetRenderedPageLink from 'Documents/UseCases/GetRenderedPageLink';
import ListRenderedPage from 'Documents/UseCases/ListRenderedPage';
import RenderPageToPdf from 'Documents/UseCases/RenderPageToPdf';
import { IdGenerator } from 'IdGenerator/IdGenerator'

export class PortsProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    //controllers
    container.addSingleton(PdfController, [RenderPageToPdf, GetRenderedPageLink, ListRenderedPage]).addSingleton(FileLinksController, [FileLinkService]);
    container.addSingleton(CalculationsController, [IdGenerator, AddCalculation, GetCalculation]);

    // queue
    container.addSingleton(DocumentRemovedEventHandler, [S3Adapter]).addSingleton(AvatarRemovedEventHandler, [S3Adapter]);
  }
}
