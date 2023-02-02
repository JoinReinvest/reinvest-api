import type {AWS} from "@serverless/typescript";

import {
    CognitoOutputs,
    CognitoResources,
} from "./devops/serverless/cognito";
import {
    LocalSignUpLambdaFunction,
    LocalSignUpLambdaResources
} from "./devops/functions/localSignUp/local-sign-up-config";
import {cognitoPostSignUpFunction, CognitoPostSignUpResources} from "./devops/functions/postSignUp/postSignUp-config";

const serverlessConfiguration: AWS = {
    service: "${env:APPLICATION_NAME}",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-dotenv-plugin",
        "serverless-output-to-env",
        "serverless-esbuild",
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
        cognitoPostSignUpFunction,
    },
    resources: {
        Resources: {
            ...CognitoResources,
            ...LocalSignUpLambdaResources,
            ...CognitoPostSignUpResources,
        },
        Outputs: {
            ...CognitoOutputs,
        }
    },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ["aws-sdk", "pg-native"],
            target: "node16",
            define: {"require.resolve": undefined},
            platform: "node",
            outputBuildFolder: "build",
            concurrency: 10,
            packager: "yarn",
        },
        bundle: {
            ignorePackages: ['pg-native'],
        },
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
