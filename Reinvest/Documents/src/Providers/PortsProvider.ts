import {Documents} from "Documents/index";
import {ContainerInterface} from "Container/Container";
import {FileLinksController} from "Documents/Port/Api/FileLinksController";
import {FileLinkService} from "Documents/Adapter/S3/FileLinkService";
import {TemplatesController} from "Documents/Port/Api/TemplatesController";
import {SigningController} from "Documents/Port/Api/SigningController";
import {DocumentRemovedEventHandler} from "Documents/Port/Queue/EventHandler/DocumentRemovedEventHandler";
import {S3Adapter} from "Documents/Adapter/S3/S3Adapter";
import {AvatarRemovedEventHandler} from "Documents/Port/Queue/EventHandler/AvatarRemovedEventHandler";

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
        ;

        // queue
        container
            .addSingleton(DocumentRemovedEventHandler, [S3Adapter])
            .addSingleton(AvatarRemovedEventHandler, [S3Adapter])
        ;
    }
}
