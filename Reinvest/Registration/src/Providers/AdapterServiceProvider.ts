import {ContainerInterface} from "Container/Container";
import {Registration} from "Registration/index";


export class AdapterServiceProvider {
    private config: Registration.Config;

    constructor(config: Registration.Config) {
        this.config = config;
    }

    public boot(container: ContainerInterface) {

    }
}
