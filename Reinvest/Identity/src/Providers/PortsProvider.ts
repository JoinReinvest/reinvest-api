import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {PhoneController} from "Identity/Port/Api/PhoneController";
import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";
import {UserRegistrationController} from "Identity/Port/Api/UserRegistrationController";
import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {ProfileService} from "Identity/Adapter/Profile/ProfileService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";
import {UserRegistrationService} from "Identity/Service/UserRegistrationService";
import {PhoneRegistrationService} from "Identity/Service/PhoneRegistrationService";

export class PortsProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(PhoneController, [PhoneRegistrationService])
            .addClass(UserRegistrationController, [UserRegistrationService])
        ;
    }
}
