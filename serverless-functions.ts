import type { AWS } from '@serverless/typescript';

import { AdminLambdaFunction, AdminLambdaResources } from './devops/functions/admin/admin-config';
import { ApiLambdaFunction, ApiLambdaResources } from './devops/functions/api/api-config';
import {
  CronDividendsCalculationFunction,
  CronDividendsCalculationResources,
} from './devops/functions/cron/dividendsCalculation/cron-dividends-calculation-config';
import {
  CronDividendsDistributionFunction,
  CronDividendsDistributionResources,
} from './devops/functions/cron/dividendsDistribution/cron-dividends-distributions-config';
import { CronDocumentSyncFunction, CronDocumentSyncResources } from './devops/functions/cron/documentSync/cron-document-sync-config';
import { CronNotificationsFunction, CronNotificationsResources } from './devops/functions/cron/notifications/cron-notifications-config';
import { CronPushEveryDayFunction, CronPushEveryDayResources } from './devops/functions/cron/pushEveryDayProcesses/cron-push-config';
import { CronRecurringInvestmentsFunction, CronRecurringInvestmentsResources } from './devops/functions/cron/recurringInvestments/recurring-investments-config';
import { CronVendorsSyncFunction, CronVendorsSyncResources } from './devops/functions/cron/vendorsSync/cron-vendors-sync-config';
import { ExplorerLambdaFunction, ExplorerLambdaResources } from './devops/functions/explorer/explorer-config';
import { FirebaseFunction, FirebaseResources } from './devops/functions/firebase/queue-config';
import { MigrationLambdaFunction, MigrationLambdaResources } from './devops/functions/migration/migration-config';
import { PdfGeneratorFunction, PdfGeneratorResources } from './devops/functions/pdfGenerator/queue-config';
import { cognitoPostSignUpFunction, CognitoPostSignUpResources } from './devops/functions/postSignUp/postSignUp-config';
import { cognitoPreSignUpFunction, CognitoPreSignUpResources } from './devops/functions/preSignUp/preSignUp-config';
import { QueueFunction, QueueResources } from './devops/functions/queue/queue-config';
import { SegmentFunction, SegmentResources } from './devops/functions/segment/queue-config';
import { TestsFunction, TestsLambdaResources } from './devops/functions/tests/tests-config';
import { UnauthorizedEndpointsFunction, UnauthorizedEndpointsLambdaResources } from './devops/functions/unauthorizedEndpoints/unauthorizedEndpoints-config';
import { CognitoAuthorizer, CognitoClientResources, CognitoClientsOutputs, CognitoEnvs } from './devops/serverless/cognito';
import { ProviderEnvironment } from './devops/serverless/serverless-common';
import { getAttribute, importOutput } from './devops/serverless/utils';

const serverlessConfiguration: AWS = {
  service: 'reinvest-functions',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: ['serverless-output-to-env', 'serverless-stack-termination-protection', 'serverless-domain-manager', 'serverless-esbuild'], //'serverless-disable-functions',
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    environment: {
      ...ProviderEnvironment,
      BASE_PATH: '/${sls:stage}',
      ExplorerHostedUI: CognitoEnvs.WebsiteExplorerHostedUI,
      BACKEND_URL: '${env:BACKEND_URL}',
      API_URL: '${env:API_URL}',
      POSTGRESQL_HOST: '${env:POSTGRESQL_HOST}',
      POSTGRESQL_DB: '${env:POSTGRESQL_DB_NAME}',
      CognitoUserPoolID: importOutput('CognitoUserPoolID'),
      S3_BUCKET_AVATARS: importOutput('AvatarsBucketName'),
      S3_BUCKET_DOCUMENTS: importOutput('DocumentsBucketName'),
      S3_BUCKET_PORTFOLIO: importOutput('PortfolioBucketName'),
      LocalCognitoClientId: { Ref: 'LocalCognito' },
      SQS_QUEUE_URL: getAttribute('SQSNotification', 'QueueUrl'),
      SQS_PDF_GENERATOR_URL: getAttribute('SQSPdfGenerator', 'QueueUrl'),
      SQS_FIREBASE_QUEUE_URL: getAttribute('SQSFirebase', 'QueueUrl'),
      SQS_SEGMENT_QUEUE_URL: getAttribute('SQSSegment', 'QueueUrl'),
      EMAIL_SEND_FROM: '${env:EMAIL_SEND_FROM}',
      EMAIL_REPLY_TO: '${env:EMAIL_REPLY_TO}',
      WEB_APP_URL: '${env:WEB_APP_URL}',
      INFRASTRUCTURE_AWS_REGION: '${aws:region}',
      POSTGRESQL_USER: '${env:POSTGRESQL_USER}',
      POSTGRESQL_PASSWORD: '${env:POSTGRESQL_PASSWORD}',
      EMAIL_DOMAIN: '${env:EMAIL_DOMAIN}',
      NORTH_CAPITAL_CLIENT_ID: '${env:NORTH_CAPITAL_CLIENT_ID}',
      NORTH_CAPITAL_DEVELOPER_API_KEY: '${env:NORTH_CAPITAL_DEVELOPER_API_KEY}',
      NORTH_CAPITAL_API_URL: '${env:NORTH_CAPITAL_API_URL}',
      VERTALO_API_URL: '${env:VERTALO_API_URL}',
      VERTALO_CLIENT_ID: '${env:VERTALO_CLIENT_ID}',
      VERTALO_CLIENT_SECRET: '${env:VERTALO_CLIENT_SECRET}',
      SNS_ORIGINATION_NUMBER: '${env:SNS_ORIGINATION_NUMBER}',
      SENTRY_DSN: '${env:SENTRY_DSN}',
      CHROMIUM_ENDPOINT: '${env:CHROMIUM_ENDPOINT}',
      DEALPATH_API_URL: '${env:DEALPATH_API_URL}',
      DEALPATH_AUTHORIZATION_TOKEN: '${env:DEALPATH_AUTHORIZATION_TOKEN}',
      DEALPATH_VERSION_HEADER: '${env:DEALPATH_VERSION_HEADER}',
      ADMIN_EMAIL: '${env:ADMIN_EMAIL}',
      PROFILEID_HASH_KEY: '${env:PROFILEID_HASH_KEY}',
      API_DOMAIN: '${env:API_DOMAIN}',
      API_CERTIFICATE_NAME: '${env:API_CERTIFICATE_NAME}',
      // FIREBASE_SERVICE_ACCOUNT_JSON: '${env:FIREBASE_SERVICE_ACCOUNT_JSON}',
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      // disableDefaultEndpoint: true,
    },
    logs: {
      httpApi: false, // turn on Api Gateway logs
      metrics: true,
    },
    httpApi: {
      cors: true,
      authorizers: {
        ...CognitoAuthorizer,
      },
    },
  },
  functions: {
    admin: AdminLambdaFunction,
    api: ApiLambdaFunction,
    explorer: ExplorerLambdaFunction,
    migration: MigrationLambdaFunction,
    unauthorizedEndpoints: UnauthorizedEndpointsFunction,
    queue: QueueFunction,
    cronDocumentsSync: CronDocumentSyncFunction,
    cronVendorsSync: CronVendorsSyncFunction,
    cronDividendsCalculation: CronDividendsCalculationFunction,
    cronDividendsDistribution: CronDividendsDistributionFunction,
    cronNotificationsFunction: CronNotificationsFunction,
    cronPushEveryDay: CronPushEveryDayFunction,
    cronRecurringInvestments: CronRecurringInvestmentsFunction,
    cognitoPostSignUpFunction,
    cognitoPreSignUpFunction,
    pdfGenerator: PdfGeneratorFunction,
    firebase: FirebaseFunction,
    segment: SegmentFunction,
    tests: TestsFunction,
  },
  resources: {
    Description: 'REINVEST ${sls:stage} API functions',
    Resources: {
      ...CognitoClientResources,
      ...CognitoPreSignUpResources,
      ...CognitoPostSignUpResources,
      ...AdminLambdaResources,
      ...ApiLambdaResources,
      ...ExplorerLambdaResources,
      ...MigrationLambdaResources,
      ...QueueResources,
      ...UnauthorizedEndpointsLambdaResources,
      ...CronDocumentSyncResources,
      ...CronVendorsSyncResources,
      ...CronDividendsCalculationResources,
      ...CronDividendsDistributionResources,
      ...CronRecurringInvestmentsResources,
      ...PdfGeneratorResources,
      ...FirebaseResources,
      ...SegmentResources,
      ...CronNotificationsResources,
      ...CronPushEveryDayResources,
      ...TestsLambdaResources,
    },
    extensions: {
      HttpApiStage: {
        Properties: {
          StageName: '${sls:stage}',
        },
      },
    },
    Outputs: {
      ...CognitoClientsOutputs,
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-native'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      outputBuildFolder: 'build',
      concurrency: 10,
      packager: 'yarn',
    },
    bundle: {
      ignorePackages: ['pg-native'],
    },
    // testFunctions: {
    //   production: false,
    //   development: true,
    //   staging: true,
    //   integrations: true,
    // },
    customDomain: {
      domainName: '${env:API_DOMAIN}',
      basePath: '',
      createRoute53Record: true,
      apiType: 'http',
      endpointType: 'regional',
      certificateName: '${env:API_CERTIFICATE_NAME}',
      autoDomain: true,
      stage: '${sls:stage}',
    },
    serverlessTerminationProtection: {
      stages: ['production'],
    },
    outputToEnv: {
      fileName: './.env.${sls:stage}',
      overwrite: false,
      map: {
        LocalCognitoClientId: 'LocalCognitoClientId',
        LocalHostedUiUrl: 'LocalHostedUiUrl',
        WebsiteHostedUiUrl: 'WebsiteHostedUiUrl',
        WebsiteCognitoClientId: 'WebsiteCognitoClientId',
        SQS_QUEUE_URL: 'SQSQueueUrl',
      },
    },
  },
};

module.exports = serverlessConfiguration;
