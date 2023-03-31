import type { AWS } from '@serverless/typescript';

import { BastionOutputs, BastionResources } from './devops/serverless/bastion';
import { CognitoOutputs, CognitoResources } from './devops/serverless/cognito';
import { RdsOutputs, RdsResources } from './devops/serverless/rds';
import { S3Outputs, S3Resources } from './devops/serverless/s3';
import { ProviderConfiguration, ProviderEnvironment } from './devops/serverless/serverless-common';
import { SesResources } from './devops/serverless/ses';
import { VpcOutputs, VpcResources } from './devops/serverless/vpc';

const serverlessConfiguration: AWS = {
  service: 'reinvest-global',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: ['serverless-stack-termination-protection'],
  //@ts-ignore
  provider: {
    ...ProviderConfiguration,
    environment: {
      ...ProviderEnvironment,
      EMAIL_SEND_FROM: '${env:EMAIL_SEND_FROM}',
    },
  },
  resources: {
    Description: 'REINVEST GLOBAL infrastructure - DO NOT REMOVE!',
    Resources: {
      ...SesResources,
    },
  },
  custom: {
    serverlessTerminationProtection: {
      stages: ['production'],
    },
  },
};

module.exports = serverlessConfiguration;
