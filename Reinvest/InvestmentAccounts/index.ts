import Container, { ContainerInterface } from "Container/Container";
import QueryProviders from "Reinvest/InvestmentAccounts/Providers/QueryProviders";
import {
  createProfileResolver,
  getProfileByUserResolver,
} from "Reinvest/InvestmentAccounts/Resolvers";

import ServiceProviders from "./Providers/ServiceProviders";

export namespace InvestmentAccounts {
  export const moduleName = "InvestmentAccounts";
  export type Config = {
    database: {
      connectionString: string;
    };
  };

  export class Module {
    private readonly config: InvestmentAccounts.Config;
    private readonly container: ContainerInterface;
    private booted = false;

    constructor(config: InvestmentAccounts.Config) {
      this.config = config;
      this.container = new Container();
    }

    private boot(): void {
      if (this.booted) {
        return;
      }

      new ServiceProviders(this.config).boot(this.container);
      new QueryProviders(this.config).boot(this.container);

      this.booted = true;
    }

    // public module API
    api() {
      this.boot();

      return {
        createProfile: (userId: string) =>
          createProfileResolver(this.container, userId),
        getProfileByUser: (userId: string) =>
          getProfileByUserResolver(this.container, userId),
      };
    }
  }

  export function create(config: InvestmentAccounts.Config) {
    return new InvestmentAccounts.Module(config);
  }
}
