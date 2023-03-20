import {ContainerInterface} from "Container/Container";
import {Registration} from "Registration/index";
import {ProfileCompletedEventHandler} from "Registration/Port/Queue/EventHandler/ProfileCompletedEventHandler";


export class PortsProvider {
    private config: Registration.Config;

    constructor(config: Registration.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {
        container
            .addSingleton(ProfileCompletedEventHandler)
        ;
    }
}
