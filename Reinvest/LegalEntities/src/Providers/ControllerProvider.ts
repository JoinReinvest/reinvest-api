import {LegalEntities} from "LegalEntities/index";
import {ContainerInterface} from "Container/Container";
import {PeopleRepository} from "LegalEntities/Adapter/Database/Repository/PeopleRepository";
import {PeopleController} from "LegalEntities/Port/Api/PeopleController";


export class ControllerProvider {
    private config: LegalEntities.Config;

    constructor(config: LegalEntities.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(PeopleController, [PeopleRepository.toString()]);
    }
}
