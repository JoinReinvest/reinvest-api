import { ContainerInterface } from 'Container/Container';
import { FileLinkService } from 'Documents/Adapter/S3/FileLinkService';
import { Documents } from 'Documents/index';
import { FileLinksController } from 'Documents/Port/Api/FileLinksController';
import { SigningController } from 'Documents/Port/Api/SigningController';
import { TemplatesController } from 'Documents/Port/Api/TemplatesController';

export class PortsProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    //controllers
    container.addSingleton(FileLinksController, [FileLinkService]).addSingleton(TemplatesController).addSingleton(SigningController);
  }
}
