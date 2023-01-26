import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";
import {PeopleController} from "LegalEntities/Port/Api/PeopleController";
import {FileLinksController} from "LegalEntities/Port/Api/FileLinksController";
import {FileLinkService} from "LegalEntities/Adapter/S3/FileLinkService";

export class PortsProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(PeopleController, [PeopleRepository.toString()])
            .addClass(FileLinksController, [FileLinkService.toString()]);
    }
}
