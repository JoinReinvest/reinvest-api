import Container, {ContainerInterface} from "Container/Container";
import ServiceProviders from "./Providers/ServiceProviders";
import QueryProviders from "Reinvest/InvestmentAccounts/Providers/QueryProviders";
import {createProfileResolver, getProfileByUserResolver} from "Reinvest/InvestmentAccounts/Resolvers";

export namespace InvestmentAccounts {
    export const moduleName = 'InvestmentAccounts';
    export type Config = {
        database: {
            connectionString: string
        }
    }

    export class Module {
        private readonly config: InvestmentAccounts.Config;
        private readonly container: ContainerInterface;
        private booted: boolean = false;

        constructor(config: InvestmentAccounts.Config) {
            this.config = config;
            this.container = new Container();
        }

        private boot(): void {
            if (this.booted) {
                return;
            }

            (new ServiceProviders(this.config)).boot(this.container);
            (new QueryProviders(this.config)).boot(this.container);

            this.booted = true;
        }

        // public module API
        api() {
            this.boot();
            return {
                createProfileResolver: (userId: string) => createProfileResolver(this.container, userId),
                getProfileByUserResolver: (userId: string) => getProfileByUserResolver(this.container, userId),
            }
        }
    }

    export function create(config: InvestmentAccounts.Config) {
        return new InvestmentAccounts.Module(config);
    }

    // export function getContainer(rootContainer: ContainerInterface): ContainerInterface {
    //     return rootContainer.getValue(InvestmentAccounts.containerToken) as ContainerInterface;
    // }
    //
    // export function setContainer(rootContainer: ContainerInterface, container: ContainerInterface): void {
    //     rootContainer.addAsValue(InvestmentAccounts.containerToken, container);
    // }
}