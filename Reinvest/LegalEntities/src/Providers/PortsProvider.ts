import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {CompleteProfileController} from "LegalEntities/Port/Api/CompleteProfileController";
import {DraftAccountsController} from "LegalEntities/Port/Api/DraftAccountsController";
import {ProfileRepository} from "LegalEntities/Adapter/Database/Repository/ProfileRepository";
import {GetProfileController} from "LegalEntities/Port/Api/GetProfileController";

export class PortsProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(CompleteProfileController, [ProfileRepository])
            .addClass(GetProfileController, [ProfileRepository])
            .addClass(DraftAccountsController)
        ;
    }
}
