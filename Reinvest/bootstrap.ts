import {InvestmentAccounts} from "InvestmentAccounts/index";
import {Investments} from "Reinvest/Investments/src/bootstrap";
import Modules from "Reinvest/Modules";
import {Identity} from "Reinvest/Identity/src";
import {LegalEntities} from "LegalEntities/index";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";

export function boot(): Modules {
    const modules = new Modules();

    const databaseConfig = {
        host: process.env.POSTGRESQL_HOST,
        user: process.env.POSTGRESQL_USER,
        password: process.env.POSTGRESQL_PASSWORD,
        database: process.env.POSTGRESQL_DB,
    } as PostgreSQLConfig

    // Investments.boot({
    //   database: {
    //     connectionString: "connection-string-test",
    //   },
    // } as Investments.Config);

    modules.register(
        Identity.moduleName,
        Identity.create({
            database: databaseConfig
        } as Identity.Config)
    );

    modules.register(
        LegalEntities.moduleName,
        LegalEntities.create({
            database: databaseConfig,
        } as LegalEntities.Config)
    );

    modules.register(
        InvestmentAccounts.moduleName,
        InvestmentAccounts.create({
            database: databaseConfig,
        } as InvestmentAccounts.Config)
    );

    console.log("App bootstrapped");

    return modules;
}
