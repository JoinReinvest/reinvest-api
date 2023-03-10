import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {PhoneController} from "Identity/Port/Api/PhoneController";
import {UserRegistrationController} from "Identity/Port/Api/UserRegistrationController";
import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {UserRegistrationService} from "Identity/Service/UserRegistrationService";
import {PhoneRegistrationService} from "Identity/Service/PhoneRegistrationService";
import {ProfileController} from "Identity/Port/Api/ProfileController";
import {IncentiveTokenVerificationController} from "Identity/Port/Api/IncentiveTokenVerificationController";
import {IncentiveTokenRepository} from "Identity/Adapter/Database/Repository/IncentiveTokenRepository";

export class PortsProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        //controllers
        container
            .addClass(ProfileController, [UserRepository])
            .addClass(PhoneController, [PhoneRegistrationService])
            .addClass(UserRegistrationController, [UserRegistrationService])
            .addClass(IncentiveTokenVerificationController, [IncentiveTokenRepository])
        ;
    }
}
