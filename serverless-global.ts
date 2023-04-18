import type {AWS} from "@serverless/typescript";
import {ProviderEnvironment} from "./devops/serverless/serverless-common";
import {SesResources} from "./devops/serverless/ses";

const serverlessConfiguration: AWS = {
    service: "reinvest-global",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-stack-termination-protection",
    ],
    provider: {
        name: "aws",
        runtime: "nodejs18.x",
        region: "us-east-1",
        environment: {
            ...ProviderEnvironment,
        }
    },
    resources: {
        Description: "REINVEST GLOBAL infrastructure - DO NOT REMOVE!",
        Resources: {
            ...SesResources,
        }
    },
    custom: {
        serverlessTerminationProtection: {
            stages: ["production"],
        },
    },
};

module.exports = serverlessConfiguration;
