import type { AWS } from '@serverless/typescript';

import { ApiLambdaFunction, ApiLambdaResources } from './devops/functions/api/api-config';
import { CronDocumentSyncFunction, CronDocumentSyncResources } from './devops/functions/cronDocumentSync/cron-document-sync-config';
import { CronVendorsSyncFunction, CronVendorsSyncResources } from './devops/functions/cronVendorsSync/cron-vendors-sync-config';
import { ExplorerLambdaFunction, ExplorerLambdaResources } from './devops/functions/explorer/explorer-config';
import { MigrationLambdaFunction, MigrationLambdaResources } from './devops/functions/migration/migration-config';
import { cognitoPostSignUpFunction, CognitoPostSignUpResources } from './devops/functions/postSignUp/postSignUp-config';
import { cognitoPreSignUpFunction, CognitoPreSignUpResources } from './devops/functions/preSignUp/preSignUp-config';
import { QueueFunction, QueueResources } from './devops/functions/queue/queue-config';
import { TestsFunction, TestsLambdaResources } from './devops/functions/tests/tests-config';
import { UnauthorizedEndpointsFunction, UnauthorizedEndpointsLambdaResources } from './devops/functions/unauthorizedEndpoints/unauthorizedEndpoints-config';
import { CognitoAuthorizer, CognitoClientResources, CognitoClientsOutputs, CognitoEnvs } from './devops/serverless/cognito';
import { margeWithApiGatewayUrl, ProviderConfiguration, ProviderEnvironment } from './devops/serverless/serverless-common';
import { getAttribute, importOutput } from './devops/serverless/utils';

const serverlessConfiguration: AWS = {
  service: 'reinvest-functions',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: ['serverless-output-to-env', 'serverless-stack-termination-protection', 'serverless-esbuild'],

  provider: {
    ...ProviderConfiguration,
    environment: {
      ...ProviderEnvironment,
      ExplorerHostedUI: CognitoEnvs.WebsiteExplorerHostedUI,
      ApiUrl: margeWithApiGatewayUrl('/api'),
      POSTGRESQL_HOST: importOutput('DatabaseHost'),
      POSTGRESQL_DB: importOutput('DatabaseName'),
      CognitoUserPoolID: importOutput('CognitoUserPoolID'),
      S3_BUCKET_AVATARS: importOutput('AvatarsBucketName'),
      S3_BUCKET_DOCUMENTS: importOutput('DocumentsBucketName'),
      LocalCognitoClientId: { Ref: 'LocalCognito' },
      SQS_QUEUE_URL: getAttribute('SQSNotification', 'QueueUrl'),
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
      NORTH_CAPITAL_OFFERING_ID: '${env:NORTH_CAPITAL_OFFERING_ID}',
      VERTALO_API_URL: '${env:VERTALO_API_URL}',
      VERTALO_CLIENT_ID: '${env:VERTALO_CLIENT_ID}',
      VERTALO_CLIENT_SECRET: '${env:VERTALO_CLIENT_SECRET}',
      SNS_ORIGINATION_NUMBER: '${env:SNS_ORIGINATION_NUMBER}',
      SENTRY_DSN: '${env:SENTRY_DSN}',
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    logs: {
      httpApi: false, // turn on Api Gateway logs
      metrics: true,
    },
    httpApi: {
      cors: true,
      //@ts-ignore
      authorizers: {
        ...CognitoAuthorizer,
      },
    },
  },
  functions: {
    api: ApiLambdaFunction,
    explorer: ExplorerLambdaFunction,
    migration: MigrationLambdaFunction,
    unauthorizedEndpoints: UnauthorizedEndpointsFunction,
    queue: QueueFunction,
    cronDocumentsSync: CronDocumentSyncFunction,
    cronVendorsSync: CronVendorsSyncFunction,
    cognitoPostSignUpFunction,
    cognitoPreSignUpFunction,
    tests: TestsFunction,
  },
  resources: {
    Description: 'REINVEST ${sls:stage} API functions',
    Resources: {
      ...CognitoClientResources,
      ...CognitoPreSignUpResources,
      ...CognitoPostSignUpResources,
      ...ApiLambdaResources,
      ...ExplorerLambdaResources,
      ...MigrationLambdaResources,
      ...QueueResources,
      ...UnauthorizedEndpointsLambdaResources,
      ...TestsLambdaResources,
      ...CronDocumentSyncResources,
      ...CronVendorsSyncResources,
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
