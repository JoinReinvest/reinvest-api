import {InvestmentAccounts} from "InvestmentAccounts/index";
import Modules from "Reinvest/Modules";
import {Identity} from "Reinvest/Identity/src";
import {LegalEntities} from "LegalEntities/index";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {COGNITO_CONFIG, DATABASE_CONFIG, S3_CONFIG, SNS_CONFIG} from "Reinvest/config";
import {Documents} from "Documents/index";
import {SNSConfig} from "Identity/Adapter/AWS/SmsService";
import {CognitoConfig} from "Identity/Adapter/AWS/CognitoService";

export function boot(): Modules {
    const modules = new Modules();

    const databaseConfig = DATABASE_CONFIG as PostgreSQLConfig;
    const s3Config = S3_CONFIG;
    const snsConfig = SNS_CONFIG as SNSConfig;
    const cognitoConfig = COGNITO_CONFIG as CognitoConfig;
    // Investments.boot({
    //   database: {
    //     connectionString: "connection-string-test",
    //   },
    // } as Investments.Config);

    modules.register(
        InvestmentAccounts.moduleName,
        InvestmentAccounts.create({
            database: databaseConfig,
        } as InvestmentAccounts.Config)
    );

    modules.register(
        Identity.moduleName,
        Identity.create({
                database: databaseConfig,
                SNS: snsConfig,
                Cognito: cognitoConfig,
            } as Identity.Config,
            {
                investmentAccounts: modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Main
            })
    );

    modules.register(
        LegalEntities.moduleName,
        LegalEntities.create({
            database: databaseConfig,
        } as LegalEntities.Config)
    );

    modules.register(
        Documents.moduleName,
        Documents.create({
            database: databaseConfig,
            s3: s3Config
        } as Documents.Config)
    );

    return modules;
}
