import type {AWS} from "@serverless/typescript";
import {ProviderConfiguration, ProviderEnvironment} from "./devops/serverless/serverless-common";
import {SesResources} from "./devops/serverless/ses";

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
