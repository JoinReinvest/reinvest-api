import {Documents} from "Documents/index";
import {ContainerInterface} from "Container/Container";
import {FileLinksController} from "Documents/Port/Api/FileLinksController";
import {FileLinkService} from "Documents/Adapter/S3/FileLinkService";
import {TemplatesController} from "Documents/Port/Api/TemplatesController";
import {SigningController} from "Documents/Port/Api/SigningController";

export class PortsProvider {
    private config: Documents.Config;

    constructor(config: Documents.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(FileLinksController, [FileLinkService])
            .addClass(TemplatesController)
            .addClass(SigningController)
        ;
    }
}
