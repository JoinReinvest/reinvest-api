import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {PhoneController} from "Identity/Port/Api/PhoneController";
import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";
import {UserRegistrationController} from "Identity/Port/Api/UserRegistrationController";
import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {ProfileService} from "Identity/Adapter/Profile/ProfileService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";

export class PortsProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(PhoneController, [PhoneRepository])
            .addClass(UserRegistrationController, [UserRepository, ProfileService, CognitoService])
    }
}
