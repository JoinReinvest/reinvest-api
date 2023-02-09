import type {AWS} from "@serverless/typescript";
import {VpcOutputs, VpcResources} from "./devops/serverless/vpc";
import {CognitoOutputs, CognitoResources} from "./devops/serverless/cognito";
import {RdsResources} from "./devops/serverless/rds";
import {S3Outputs, S3Resources} from "./devops/serverless/s3";
import {BastionResources} from "./devops/serverless/bastion";
import {ProviderConfiguration} from "./devops/serverless/serverless-common";

const serverlessConfiguration: AWS = {
    service: "${env:APPLICATION_NAME}",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-dotenv-plugin",
        // "serverless-output-to-env",
        "serverless-stack-termination-protection",
    ],
    //@ts-ignore
    provider: {...ProviderConfiguration},
    resources: {
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
        }
    },
    custom: {
        serverlessTerminationProtection: {
            stages: ["production"],
        },
        // outputToEnv: {
        //     fileName: "../../../.env",
        //     overwrite: false,
        //     map: {
        //         CognitoHostedUiUrl: "HostedUIURL",
        //         CognitoUserPoolID: "CognitoUserPoolID",
        //         CognitoPostmanClientId: "CognitoUserPoolClientPostmanClientId",
        //         CognitoIssuerUrl: "CognitoIssuerUrl",
        //     }
        // },
    },
};

module.exports = serverlessConfiguration;
