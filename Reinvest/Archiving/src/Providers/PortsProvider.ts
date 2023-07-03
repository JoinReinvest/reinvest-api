import { Archiving } from 'Archiving/index';
import { ContainerInterface } from 'Container/Container';

export class PortsProvider {
  private config: Archiving.Config;

  constructor(config: Archiving.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    //controllers
    // container.addSingleton(PdfController, [RenderPageToPdf, GetRenderedPageLink, ListRenderedPage]).addSingleton(FileLinksController, [FileLinkService]);
    // queue
    // container.addSingleton(DocumentRemovedEventHandler, [S3Adapter]).addSingleton(AvatarRemovedEventHandler, [S3Adapter]);
  }
}
