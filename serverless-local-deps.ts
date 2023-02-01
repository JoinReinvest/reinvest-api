import type {AWS} from "@serverless/typescript";

import {
    CognitoOutputs,
    CognitoResources,
} from "./devops/serverless/cognito";
import {LocalSignUpLambdaFunction, LocalSignUpLambdaResources} from "./devops/functions/localSignUp/local-sign-up-config";

const serverlessConfiguration: AWS = {
    service: "${env:APPLICATION_NAME}",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-output-to-env",
    ],
    provider: {
        name: "aws",
        runtime: "nodejs16.x",
        region: "eu-west-2",
        environment: {
            SERVERLESS_SERVICE: "${self:service}",
            SERVERLESS_ACCOUNT_ID: "${aws:accountId}",
            SERVERLESS_STAGE: "${sls:stage}",
            SERVERLESS_REGION: "${aws:region}",
        },
    },

    functions: {
        localSignUp: LocalSignUpLambdaFunction,
    },
    resources: {
        Resources: {
            ...CognitoResources,
            ...LocalSignUpLambdaResources,
        },
        Outputs: {
            ...CognitoOutputs,
        }
    },
    custom: {
        outputToEnv: {
            fileName: "./.env",
            overwrite: false,
            map: {
                CognitoHostedUiUrl: "HostedUIURL",
                CognitoUserPoolID: "CognitoUserPoolID",
                CognitoPostmanClientId: "CognitoUserPoolClientPostmanClientId",
                CognitoIssuerUrl: "CognitoIssuerUrl",
            }
        },
    },
};

module.exports = serverlessConfiguration;
