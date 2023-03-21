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
    CognitoAuthorizerName, CognitoClientResources, CognitoOutputs,
    CognitoResources,
} from "./devops/serverless/cognito";
import {S3Resources} from "./devops/serverless/s3";
import {VpcResources} from "./devops/serverless/vpc";
import {QueueFunction, QueueOutputs, QueueResources} from "./devops/functions/queue/queue-config";
import {cognitoPostSignUpFunction, CognitoPostSignUpResources} from "./devops/functions/postSignUp/postSignUp-config";
import {
    LocalSignUpLambdaFunction,
    LocalSignUpLambdaResources
} from "./devops/functions/localSignUp/local-sign-up-config";
import {cognitoPreSignUpFunction, CognitoPreSignUpResources} from "./devops/functions/preSignUp/preSignUp-config";
import {ProviderEnvironment} from "./devops/serverless/serverless-common";
import {MigrationLambdaFunction, MigrationLambdaResources} from "./devops/functions/migration/migration-config";
import {SesResources} from "./devops/serverless/ses";
import {
    UnauthorizedEndpointsFunction,
    UnauthorizedEndpointsLambdaResources
} from "./devops/functions/unauthorizedEndpoints/unauthorizedEndpoints-config";
import {TestsFunction, TestsLambdaResources} from "./devops/functions/tests/tests-config";

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
            ApiUrl: "http://localhost:3000/api",
            SQS_QUEUE_URL: "http://localhost:9324/000000000000/development-sqs-notification",
            IT_IS_LOCAL: "true",
        },
        logs: {
            httpApi: true, // turn on Api Gateway logs
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
        migration: MigrationLambdaFunction,
        queue: QueueFunction,
        cognitoPostSignUpFunction,
        cognitoPreSignUpFunction,
        localSignUp: LocalSignUpLambdaFunction,
        unauthorizedEndpoints: UnauthorizedEndpointsFunction,
        tests: TestsFunction,
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
            ...MigrationLambdaResources,
            ...UnauthorizedEndpointsLambdaResources,
            ...QueueResources,
            ...LocalSignUpLambdaResources,
            ...SesResources,
            ...TestsLambdaResources,
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
            region: 'us-east-1',
            endpoint: 'http://0.0.0.0:9324'
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
