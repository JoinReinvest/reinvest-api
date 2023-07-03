import { Archiving } from 'Archiving/index';
import { ContainerInterface } from 'Container/Container';

export class UseCaseProvider {
  private config: Archiving.Config;

  constructor(config: Archiving.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // container.addSingleton(IdGenerator);
    // container.addSingleton(RenderPageToPdf, [ArchivingPdfPageRepository, IdGenerator]);
    // container.addSingleton(GetRenderedPageLink, [S3Adapter]);
    // container.addSingleton(ListRenderedPage, [ArchivingPdfPageRepository]);
  }
}
