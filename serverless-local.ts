import type {AWS} from "@serverless/typescript";

import {
    ApiLambdaFunction,
    ApiLambdaResources,
} from "./devops/functions/api/api-config";
import {
    ExplorerLambdaFunction,
    ExplorerLambdaResources,
} from "./devops/functions/explorer/explorer-config";
import {
    CognitoAuthorizerName, CognitoClientResources, CognitoEnvs, CognitoOutputs,
    CognitoResources,
} from "./devops/serverless/cognito";
import {S3Resources} from "./devops/serverless/s3";
import {VpcResources} from "./devops/serverless/vpc";
import {QueueFunction, QueueResources} from "./devops/functions/queue/queue-config";
import {cognitoPostSignUpFunction, CognitoPostSignUpResources} from "./devops/functions/postSignUp/postSignUp-config";
import {
    LocalSignUpLambdaFunction,
    LocalSignUpLambdaResources
} from "./devops/functions/localSignUp/local-sign-up-config";
import {cognitoPreSignUpFunction, CognitoPreSignUpResources} from "./devops/functions/preSignUp/preSignUp-config";
import {ProviderEnvironment} from "./devops/serverless/serverless-common";

const serverlessConfiguration: AWS = {
    service: "reinvest-local",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-dotenv-plugin",
        "serverless-offline-sqs",
        "serverless-offline",
        "serverless-offline-watcher",
        "serverless-esbuild",
    ],
    provider: {
        name: "aws",
        runtime: "nodejs16.x",
        region: "us-east-1",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            ...ProviderEnvironment,
            // @ts-ignore
            ExplorerHostedUI: "${env:LocalHostedUiUrl}",
            ApiUrl: "http://localhost:3000/api"
        },
        logs: {
            httpApi: false, // turn on Api Gateway logs
            metrics: true,
        },
        httpApi: {
            cors: true,
            //@ts-ignore
            authorizers: {
                [CognitoAuthorizerName]: {
                    identitySource: "$request.header.Authorization",
                    issuerUrl: "${env:CognitoIssuerUrl}",
                    audience: "${env:LocalCognitoClientId}"
                }
            },
        },
    },
    functions: {
        api: ApiLambdaFunction,
        explorer: ExplorerLambdaFunction,
        queue: QueueFunction,
        cognitoPostSignUpFunction,
        cognitoPreSignUpFunction,
        localSignUp: LocalSignUpLambdaFunction,
    },
    resources: {
        Resources: {
            ...VpcResources,
            ...CognitoResources,
            ...CognitoClientResources,
            ...CognitoPreSignUpResources,
            ...CognitoPostSignUpResources,
            ...S3Resources,
            ...ApiLambdaResources,
            ...ExplorerLambdaResources,
            ...QueueResources,
            ...LocalSignUpLambdaResources,
        },
        Outputs: {
            ...CognitoOutputs,
        }
    },
    package: {individually: true},
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
