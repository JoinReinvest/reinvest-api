import type {AWS} from "@serverless/typescript";
import {VpcOutputs, VpcResources} from "./devops/serverless/vpc";
import {CognitoOutputs, CognitoResources} from "./devops/serverless/cognito";
import {RdsOutputs, RdsResources} from "./devops/serverless/rds";
import {S3Outputs, S3Resources} from "./devops/serverless/s3";
import {BastionOutputs, BastionResources} from "./devops/serverless/bastion";
import {ProviderConfiguration, ProviderEnvironment} from "./devops/serverless/serverless-common";

const serverlessConfiguration: AWS = {
    service: "reinvest",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-output-to-env",
        "serverless-stack-termination-protection",
    ],
    //@ts-ignore
    provider: {
        ...ProviderConfiguration,
        environment: {
            ...ProviderEnvironment,
            COGNITO_RETENTION_POLICY: 'Delete'
        }
    },
    resources: {
        Description: "REINVEST ${sls:stage} infrastructure - DO NOT REMOVE!",
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
            ...RdsOutputs,
            ...BastionOutputs,
        }
    },
    custom: {
        serverlessTerminationProtection: {
            stages: ["production"],
        },
        outputToEnv: {
            fileName: "./.env.${sls:stage}",
            overwrite: false,
            map: {
                CognitoUserPoolID: "CognitoUserPoolID",
                CognitoIssuerUrl: "CognitoIssuerUrl",
                BastionHostName: "BastionHostName",
                DatabaseName: "DatabaseName",
                DatabaseHost: "DatabaseHost",
            }
        },
    },
};

module.exports = serverlessConfiguration;
