import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {PhoneController} from "Identity/Port/Api/PhoneController";
import {UserRegistrationController} from "Identity/Port/Api/UserRegistrationController";
import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {UserRegistrationService} from "Identity/Service/UserRegistrationService";
import {PhoneRegistrationService} from "Identity/Service/PhoneRegistrationService";
import {ProfileController} from "Identity/Port/Api/ProfileController";
import {IncentiveTokenController} from "Identity/Port/Api/IncentiveTokenController";
import {IncentiveTokenRepository} from "Identity/Adapter/Database/Repository/IncentiveTokenRepository";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";

export class PortsProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container.addAsValue('webAppUrl', this.config.webAppUrl);
        //controllers
        container
            .addSingleton(ProfileController, [UserRepository])
            .addSingleton(PhoneController, [PhoneRegistrationService, CognitoService])
            .addSingleton(UserRegistrationController, [UserRegistrationService])
            .addSingleton(IncentiveTokenController, [IncentiveTokenRepository, 'webAppUrl'])
        ;
    }
}
