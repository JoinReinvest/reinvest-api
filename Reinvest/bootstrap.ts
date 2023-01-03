import {Investments} from "Investments/src/bootstrap"
import {InvestmentAccounts} from "Reinvest/InvestmentAccounts/bootstrap";

export class Modules {
    private modules = {};

    register<Module>(moduleName: string, module: Module): void {
        // @ts-ignore
        this.modules[moduleName] = module;
    }

    get<Module>(moduleName: string): Module {
        // @ts-ignore
        return this.modules[moduleName];
    }
}

export function boot(): Modules {
    const modules = new Modules();
    Investments.boot({
        database: {
            connectionString: "connection-string-test"
        }
    } as Investments.Config);

    modules.register(InvestmentAccounts.moduleName, InvestmentAccounts.create({
        database: {
            connectionString: "connection-string-test"
        }
    } as InvestmentAccounts.Config));

//postgres://executive:password@localhost/lukaszd_staging_db


    console.log('App bootstrapped');

    return modules;
}

