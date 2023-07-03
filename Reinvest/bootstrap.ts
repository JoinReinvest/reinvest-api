import { Archiving } from 'Archiving/index';
import { Documents } from 'Documents/index';
import { CognitoConfig } from 'Identity/Adapter/AWS/CognitoService';
import { SNSConfig } from 'Identity/Adapter/AWS/SmsService';
import { InvestmentAccounts } from 'InvestmentAccounts/index';
import { Investments } from 'Investments/index';
import { LegalEntities } from 'LegalEntities/index';
import { logger } from 'Logger/logger';
import { Notifications } from 'Notifications/index';
import { DealpathConfig } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';
import { Portfolio } from 'Portfolio/index';
import { PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { NorthCapitalConfig } from 'Registration/Adapter/NorthCapital/NorthCapitalAdapter';
import { VertaloConfig } from 'Registration/Adapter/Vertalo/ExecutionVertaloAdapter';
import {
  CHROMIUM_ENDPOINT,
  COGNITO_CONFIG,
  DATABASE_CONFIG,
  DEALPATH_CONFIG,
  EMAIL_DOMAIN,
  FIREBASE_SQS_CONFIG,
  NORTH_CAPITAL_CONFIG,
  PDF_GENERATOR_SQS_CONFIG,
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
import { SharesAndDividends } from 'SharesAndDividends/index';
import { Trading } from 'Trading/index';
import { Verification } from 'Verification/index';
import { Withdrawals } from 'Withdrawals/index';

console = logger(SENTRY_CONFIG);

export function boot(): Modules {
  const modules = new Modules();

  const databaseConfig = DATABASE_CONFIG as PostgreSQLConfig;
  const s3Config = S3_CONFIG;
  const snsConfig = SNS_CONFIG as SNSConfig;
  const cognitoConfig = COGNITO_CONFIG as CognitoConfig;
  const queueConfig = SQS_CONFIG as QueueConfig;
  const pdfGeneratorQueue = PDF_GENERATOR_SQS_CONFIG as QueueConfig;
  const firebaseQueue = FIREBASE_SQS_CONFIG as QueueConfig;
  const northCapitalConfig = NORTH_CAPITAL_CONFIG as NorthCapitalConfig;
  const vertaloConfig = VERTALO_CONFIG as VertaloConfig;
  const dealpathConfig = DEALPATH_CONFIG as DealpathConfig;

  modules.register(
    Notifications.moduleName,
    Notifications.create({
      database: databaseConfig,
      queue: queueConfig,
      firebaseQueue: firebaseQueue,
    } as Notifications.Config),
  );

  modules.register(
    Documents.moduleName,
    Documents.create({
      database: databaseConfig,
      s3: s3Config,
      pdfGeneratorQueue,
      chromiumEndpoint: CHROMIUM_ENDPOINT,
    } as Documents.Config),
  );

  modules.register(
    Portfolio.moduleName,
    Portfolio.create(
      {
        database: databaseConfig,
        queue: queueConfig,
        dealpathConfig,
      } as Portfolio.Config,
      {
        documents: modules.get(Documents.moduleName) as Documents.Main,
      },
    ),
  );

  modules.register(
    SharesAndDividends.moduleName,
    SharesAndDividends.create(
      {
        database: databaseConfig,
        queue: queueConfig,
      } as SharesAndDividends.Config,
      {
        portfolio: modules.get(Portfolio.moduleName) as Portfolio.Main,
        notifications: modules.get(Notifications.moduleName) as Notifications.Main,
      },
    ),
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
        queue: queueConfig,
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
        identity: modules.get(Identity.moduleName) as Identity.Main,
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
    Investments.create(
      {
        database: databaseConfig,
        queue: queueConfig,
        pdfGeneratorQueue,
      } as Investments.Config,
      {
        sharesAndDividends: modules.get(SharesAndDividends.moduleName) as SharesAndDividends.Main,
        documents: modules.get(Documents.moduleName) as Documents.Main,
        verification: modules.get(Verification.moduleName) as Verification.Main,
      },
    ),
  );

  modules.register(
    Trading.moduleName,
    Trading.create(
      {
        database: databaseConfig,
        queue: queueConfig,
        northCapital: northCapitalConfig,
        vertalo: vertaloConfig,
      } as Trading.Config,
      {
        registration: modules.get(Registration.moduleName) as Registration.Main,
        documents: modules.get(Documents.moduleName) as Documents.Main,
        portfolio: modules.get(Portfolio.moduleName) as Portfolio.Main,
        verification: modules.get(Verification.moduleName) as Verification.Main,
      },
    ),
  );

  modules.register(
    Withdrawals.moduleName,
    Withdrawals.create(
      {
        database: databaseConfig,
        queue: queueConfig,
      } as Withdrawals.Config,
      {
        documents: modules.get(Documents.moduleName) as Documents.Main,
        sharesAndDividends: modules.get(SharesAndDividends.moduleName) as SharesAndDividends.Main,
        registration: modules.get(Registration.moduleName) as Registration.Main,
      },
    ),
  );

  modules.register(
    Archiving.moduleName,
    Archiving.create(
      {
        database: databaseConfig,
      } as Archiving.Config,
      {
        legalEntities: modules.get(LegalEntities.moduleName) as LegalEntities.Main,
        investments: modules.get(Investments.moduleName) as Investments.Main,
      },
    ),
  );

  return modules;
}
