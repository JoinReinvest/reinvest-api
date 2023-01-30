import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";
import {ProfileController} from "LegalEntities/Port/Api/ProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";

export class PortsProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container

            .addClass(ProfileController, [PeopleRepository])
            .addClass(DraftAccountsController)
        ;
    }
}
