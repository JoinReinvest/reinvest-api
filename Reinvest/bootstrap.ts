import {InvestmentAccounts} from "InvestmentAccounts/index";
import Modules from "Reinvest/Modules";
import {Identity} from "Reinvest/Identity/src";
import {LegalEntities} from "LegalEntities/index";
import {PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {
    COGNITO_CONFIG,
    DATABASE_CONFIG, EMAIL_DOMAIN,
    NORTH_CAPITAL_CONFIG,
    VERTALO_CONFIG,
    S3_CONFIG,
    SNS_CONFIG, SQS_CONFIG,
    WEB_APP_URL
} from "Reinvest/config";
import {Documents} from "Documents/index";
import {Registration} from "Reinvest/Registration/src";
import {SNSConfig} from "Identity/Adapter/AWS/SmsService";
import {CognitoConfig} from "Identity/Adapter/AWS/CognitoService";
import {QueueConfig} from "shared/hkek-sqs/QueueSender";
import {NorthCapitalConfig} from "Registration/Adapter/NorthCapital/NorthCapitalAdapter";
import {VertaloConfig} from "Registration/Adapter/Vertalo/ExecutionVertaloAdapter";

export function boot(): Modules {
    const modules = new Modules();

    const databaseConfig = DATABASE_CONFIG as PostgreSQLConfig;
    const s3Config = S3_CONFIG;
    const snsConfig = SNS_CONFIG as SNSConfig;
    const cognitoConfig = COGNITO_CONFIG as CognitoConfig;
    const queueConfig = SQS_CONFIG as QueueConfig;
    const northCapitalConfig = NORTH_CAPITAL_CONFIG as NorthCapitalConfig;
    const vertaloConfig = VERTALO_CONFIG as VertaloConfig;
    // Investments.boot({
    //   database: {
    //     connectionString: "connection-string-test",
    //   },
    // } as Investments.Config);

    modules.register(
        Documents.moduleName,
        Documents.create({
            database: databaseConfig,
            s3: s3Config
        } as Documents.Config)
    );

    modules.register(
        InvestmentAccounts.moduleName,
        InvestmentAccounts.create({
            database: databaseConfig,
            queue: queueConfig,
        } as InvestmentAccounts.Config)
    );

    modules.register(
        Identity.moduleName,
        Identity.create({
                database: databaseConfig,
                SNS: snsConfig,
                Cognito: cognitoConfig,
                webAppUrl: WEB_APP_URL,
            } as Identity.Config,
            {
                investmentAccounts: modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Main
            })
    );

    modules.register(
        LegalEntities.moduleName,
        LegalEntities.create({
            database: databaseConfig,
            queue: queueConfig,
        } as LegalEntities.Config, {
            documents: modules.get(Documents.moduleName) as Documents.Main,
            investmentAccounts: modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Main
        })
    );

    modules.register(
        Registration.moduleName,
        Registration.create({
            database: databaseConfig,
            northCapital: northCapitalConfig,
            vertalo: vertaloConfig,
            emailDomain: EMAIL_DOMAIN,
        } as Registration.Config, {
            legalEntities: modules.get(LegalEntities.moduleName) as LegalEntities.Main,
        })
    );


    return modules;
}
