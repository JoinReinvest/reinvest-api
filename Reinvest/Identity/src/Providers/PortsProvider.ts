import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {PhoneController} from "Identity/Port/Api/PhoneController";
import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";

export class PortsProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(PhoneController, [PhoneRepository])
    }
}
