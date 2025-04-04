import type { AWS } from '@serverless/typescript';

import { BastionOutputs, BastionResources } from './devops/serverless/bastion';
import { CognitoOutputs, CognitoResources } from './devops/serverless/cognito';
import { RdsOutputs, RdsResources } from './devops/serverless/rds';
import { S3Outputs, S3Resources } from './devops/serverless/s3';
import { ProviderEnvironment } from './devops/serverless/serverless-common';
import { VpcOutputs, VpcResources } from './devops/serverless/vpc';

const serverlessConfiguration: AWS = {
  service: 'reinvest-restore',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: [],
  //@ts-ignore
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    environment: {
      ...ProviderEnvironment,
      COGNITO_RETENTION_POLICY: 'Delete',
      POSTGRESQL_AWS_DB_INSTANCE: '${env:POSTGRESQL_AWS_DB_INSTANCE}',
      POSTGRESQL_AWS_DB_RETENTION_POLICY: '${env:POSTGRESQL_AWS_DB_RETENTION_POLICY}',
      POSTGRESQL_AWS_DB_STORAGE_GB: '${env:POSTGRESQL_AWS_DB_STORAGE_GB}',
      POSTGRESQL_MAIN_USER: '${env:POSTGRESQL_MAIN_USER}',
      POSTGRESQL_MAIN_PASSWORD: '${env:POSTGRESQL_MAIN_PASSWORD}',
    },
  },
  resources: {
    Description: 'REINVEST ${sls:stage} infrastructure - DO NOT REMOVE!',
    Resources: {
      ...VpcResources,
      ...CognitoResources,
      ...RdsResources,
      ...S3Resources,
      ...BastionResources,
    },
    Outputs: {
      ...CognitoOutputs,
      ...VpcOutputs,
      ...S3Outputs,
      ...BastionOutputs,
      ...RdsOutputs, // do not use these outputs in other stacks! In other way the snapshot restore will not work!
    },
  },
  custom: {
    serverlessTerminationProtection: {
      stages: ['production'],
    },
    outputToEnv: {
      fileName: './.env.${sls:stage}',
      overwrite: false,
      map: {
        CognitoUserPoolID: 'CognitoUserPoolID',
        CognitoIssuerUrl: 'CognitoIssuerUrl',
        BastionHostName: 'BastionHostName',
        S3_BUCKET_DOCUMENTS: 'S3_BUCKET_DOCUMENTS',
        S3_BUCKET_AVATARS: 'S3_BUCKET_AVATARS',
      },
    },
  },
};

module.exports = serverlessConfiguration;
