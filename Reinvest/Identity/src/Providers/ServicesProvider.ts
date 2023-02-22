import {Identity} from "Identity/index";
import {ContainerInterface} from "Container/Container";
import {UserRepository} from "Identity/Adapter/Database/Repository/UserRepository";
import {ProfileService} from "Identity/Adapter/Profile/ProfileService";
import {CognitoService} from "Identity/Adapter/AWS/CognitoService";
import {UserRegistrationService} from "Identity/Service/UserRegistrationService";
import {IdGenerator} from "IdGenerator/IdGenerator";
import {PhoneRegistrationService} from "Identity/Service/PhoneRegistrationService";
import {PhoneRepository} from "Identity/Adapter/Database/Repository/PhoneRepository";
import {UniqueTokenGenerator} from "IdGenerator/UniqueTokenGenerator";

export class ServicesProvider {
    private config: Identity.Config;

    constructor(config: Identity.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addClass(UserRegistrationService, [UserRepository, ProfileService, CognitoService, IdGenerator])
            .addClass(PhoneRegistrationService, [UserRepository, PhoneRepository, UniqueTokenGenerator])
        ;
    }
}
