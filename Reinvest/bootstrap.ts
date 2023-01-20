import {InvestmentAccounts} from "InvestmentAccounts/index";
import {Investments} from "Reinvest/Investments/src/bootstrap";
import Modules from "Reinvest/Modules";
import {Identity} from "Reinvest/Identity/src";
import {LegalEntities} from "LegalEntities/index";

export function boot(): Modules {
    const modules = new Modules();
    // Investments.boot({
    //   database: {
    //     connectionString: "connection-string-test",
    //   },
    // } as Investments.Config);

    modules.register(
        Identity.moduleName,
        Identity.create({
            database: {
                connectionString: "connection-string-test",
            },
        } as Identity.Config)
    );

    modules.register(
        LegalEntities.moduleName,
        LegalEntities.create({
            database: {
                connectionString: "connection-string-test",
            },
        } as LegalEntities.Config)
    );


    modules.register(
        InvestmentAccounts.moduleName,
        InvestmentAccounts.create({
            database: {
                connectionString: "connection-string-test",
            },
        } as InvestmentAccounts.Config)
    );

    console.log("App bootstrapped");

    return modules;
}
