import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {ProfileController} from "LegalEntities/Port/Api/ProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";

export class PortsProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container

            .addClass(ProfileController, [ProfileRepository])
            .addClass(DraftAccountsController)
        ;
    }
}
