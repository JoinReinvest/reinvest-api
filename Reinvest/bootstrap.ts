import {InvestmentAccounts} from "InvestmentAccounts/index";
import Modules from "Reinvest/Modules";
import {Identity} from "Reinvest/Identity/src";
import {LegalEntities} from "LegalEntities/index";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {DATABASE_CONFIG, S3_CONFIG} from "Reinvest/config";

export function boot(): Modules {
    const modules = new Modules();

    const databaseConfig = DATABASE_CONFIG as PostgreSQLConfig
    const s3Config = S3_CONFIG;

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
            s3: s3Config
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
