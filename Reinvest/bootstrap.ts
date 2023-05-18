import { Documents } from 'Documents/index';
import { CognitoConfig } from 'Identity/Adapter/AWS/CognitoService';
import { SNSConfig } from 'Identity/Adapter/AWS/SmsService';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { Investments } from 'Investments/index';
import { LegalEntities } from 'LegalEntities/index';
import { logger } from 'Logger/logger';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { NorthCapitalConfig } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { VertaloConfig } from 'Registration/Adapter/Vertalo/ExecutionVertaloAdapter';
import {
  COGNITO_CONFIG,
  DATABASE_CONFIG,
  EMAIL_DOMAIN,
  NORTH_CAPITAL_CONFIG,
  S3_CONFIG,
  SENTRY_CONFIG,
  SNS_CONFIG,
  SQS_CONFIG,
  VERTALO_CONFIG,
  WEB_APP_URL,
} from 'Reinvest/config';
import { Identity } from 'Reinvest/Identity/src';
import Modules from 'Reinvest/Modules';
import { Registration } from 'Reinvest/Registration/src';
import { QueueConfig } from 'shared/hkek-sqs/QueueSender';
import { Trading } from 'Trading/index';
import { Verification } from 'Verification/index';

console = logger(SENTRY_CONFIG);

export function boot(): Modules {
  const modules = new Modules();

  const databaseConfig = DATABASE_CONFIG as PostgreSQLConfig;
  const s3Config = S3_CONFIG;
  const snsConfig = SNS_CONFIG as SNSConfig;
  const cognitoConfig = COGNITO_CONFIG as CognitoConfig;
  const queueConfig = SQS_CONFIG as QueueConfig;
  const northCapitalConfig = NORTH_CAPITAL_CONFIG as NorthCapitalConfig;
  const vertaloConfig = VERTALO_CONFIG as VertaloConfig;

  modules.register(
    Documents.moduleName,
    Documents.create({
      database: databaseConfig,
      s3: s3Config,
    } as Documents.Config),
  );

  modules.register(
    InvestmentAccounts.moduleName,
    InvestmentAccounts.create({
      database: databaseConfig,
      queue: queueConfig,
    } as InvestmentAccounts.Config),
  );

  modules.register(
    Identity.moduleName,
    Identity.create(
      {
        database: databaseConfig,
        SNS: snsConfig,
        Cognito: cognitoConfig,
        webAppUrl: WEB_APP_URL,
      } as Identity.Config,
      {
        investmentAccounts: modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Main,
      },
    ),
  );

  modules.register(
    LegalEntities.moduleName,
    LegalEntities.create(
      {
        database: databaseConfig,
        queue: queueConfig,
      } as LegalEntities.Config,
      {
        documents: modules.get(Documents.moduleName) as Documents.Main,
        investmentAccounts: modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Main,
      },
    ),
  );

  modules.register(
    Registration.moduleName,
    Registration.create(
      {
        database: databaseConfig,
        northCapital: northCapitalConfig,
        vertalo: vertaloConfig,
        emailDomain: EMAIL_DOMAIN,
      } as Registration.Config,
      {
        legalEntities: modules.get(LegalEntities.moduleName) as LegalEntities.Main,
        documents: modules.get(Documents.moduleName) as Documents.Main,
      },
    ),
  );

  modules.register(
    Verification.moduleName,
    Verification.create(
      {
        database: databaseConfig,
        northCapital: northCapitalConfig,
        queue: queueConfig,
      } as Verification.Config,
      {
        registration: modules.get(Registration.moduleName) as Registration.Main,
      },
    ),
  );

  modules.register(
    Investments.moduleName,
    Investments.create({
      database: databaseConfig,
      queue: queueConfig,
    } as Investments.Config),
  );

  modules.register(
    Trading.moduleName,
    Trading.create({
      database: databaseConfig,
      queue: queueConfig,
      northCapital: northCapitalConfig,
      vertalo: vertaloConfig,
    } as Trading.Config),
  );

  return modules;
}
