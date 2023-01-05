import type { AWS } from "@serverless/typescript";

import {
  ApiLambdaFunction,
  ApiLambdaResources,
} from "./devops/functions/api/api-config";
import {
  ExplorerLambdaFunction,
  ExplorerLambdaResources,
} from "./devops/functions/explorer/explorer-config";
import { BastionResources } from "./devops/serverless/bastion";
import {
  CognitoAuthorizer,
  CognitoResources,
} from "./devops/serverless/cognito";
import { RdsResources } from "./devops/serverless/rds";
import { S3Resources } from "./devops/serverless/s3";
import { VpcResources } from "./devops/serverless/vpc";
import {QueueFunction, QueueResources} from "./devops/functions/queue/queue-config";

const serverlessConfiguration: AWS = {
  service: "${env:APPLICATION_NAME}",
  frameworkVersion: "3",
  useDotenv: true,
  plugins: [
    "serverless-esbuild",
    "serverless-stack-termination-protection",
    "serverless-offline-sqs",
    "serverless-offline",
    "serverless-offline-watcher",
  ], //  'serverless-domain-manager'
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    region: "eu-west-2",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      SERVERLESS_SERVICE: "${self:service}",
      SERVERLESS_ACCOUNT_ID: "${aws:accountId}",
      SERVERLESS_STAGE: "${sls:stage}",
      SERVERLESS_REGION: "${aws:region}",
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
    queue: QueueFunction,
  },
  resources: {
    Resources: {
      ...VpcResources,
      ...CognitoResources,
      ...RdsResources,
      ...S3Resources,
      ...ApiLambdaResources,
      ...ExplorerLambdaResources,
      ...BastionResources,
      ...QueueResources,
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node16",
      define: { "require.resolve": undefined },
      platform: "node",
      outputBuildFolder: "build",
      concurrency: 10,
      packager: "yarn",
    },
    'serverless-offline-sqs': {
      autoCreate: true,
      apiVersion: '2012-11-05',
      region: '${aws:region}',
      endpoint: 'http://0.0.0.0:9324',
    },
    bundle: {
      ignorePackages: ['pg-native'],
    },
    serverlessTerminationProtection: {
      stages: ["production"],
    },
    "serverless-offline": {
      useChildProcesses: true,
      noPrependStageInUrl: true,
    },
    "serverless-offline-watcher": [
      {
        path: ["Reinvest", "devops", "shared"],
        command: `echo "Source files modified"`,
      },
    ],
  },
};

module.exports = serverlessConfiguration;
