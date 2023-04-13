import type {AWS} from "@serverless/typescript";
import {VpcOutputs, VpcResources} from "./devops/serverless/vpc";
import {CognitoOutputs, CognitoResources} from "./devops/serverless/cognito";
import {RdsOutputs, RdsResources} from "./devops/serverless/rds";
import {S3Outputs, S3Resources} from "./devops/serverless/s3";
import {BastionOutputs, BastionResources} from "./devops/serverless/bastion";
import {ProviderConfiguration, ProviderEnvironment} from "./devops/serverless/serverless-common";
import {SesOutputs, SesResources} from "./devops/serverless/ses";

const serverlessConfiguration: AWS = {
    service: "reinvest-global",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-stack-termination-protection",
    ],
    //@ts-ignore
    provider: {
        ...ProviderConfiguration,
        environment: {
            ...ProviderEnvironment,
            EMAIL_SEND_FROM: "${env:EMAIL_SEND_FROM}",
        }
    },
    resources: {
        Description: "REINVEST GLOBAL infrastructure - DO NOT REMOVE!",
        Resources: {
            ...SesResources,
        },
        Outputs: {
            ...SesOutputs,
        }
    },
    custom: {
        serverlessTerminationProtection: {
            stages: ["production"],
        },
    },
};

module.exports = serverlessConfiguration;
