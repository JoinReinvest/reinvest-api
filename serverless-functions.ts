import type {AWS} from "@serverless/typescript";
import {
    CognitoAuthorizer,
    CognitoClientResources,
    CognitoClientsOutputs,
    CognitoEnvs
} from "./devops/serverless/cognito";
import {
    margeWithApiGatewayUrl,
    ProviderConfiguration,
    ProviderEnvironment
} from "./devops/serverless/serverless-common";
import {ApiLambdaFunction, ApiLambdaResources} from "./devops/functions/api/api-config";
import {ExplorerLambdaFunction, ExplorerLambdaResources} from "./devops/functions/explorer/explorer-config";
import {QueueFunction} from "./devops/functions/queue/queue-config";
import {cognitoPostSignUpFunction, CognitoPostSignUpResources} from "./devops/functions/postSignUp/postSignUp-config";
import {cognitoPreSignUpFunction, CognitoPreSignUpResources} from "./devops/functions/preSignUp/preSignUp-config";
import {MigrationLambdaFunction, MigrationLambdaResources} from "./devops/functions/migration/migration-config";
import {importOutput} from "./devops/serverless/utils";

const serverlessConfiguration: AWS = {
    service: "reinvest-functions",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-output-to-env",
        "serverless-stack-termination-protection",
        "serverless-esbuild",
    ],
    // @ts-ignore
    provider: {
        ...ProviderConfiguration,
        environment: {
            ...ProviderEnvironment,
            ExplorerHostedUI: CognitoEnvs.WebsiteExplorerHostedUI,
            ApiUrl: margeWithApiGatewayUrl('/api'),
            POSTGRESQL_HOST: importOutput('DatabaseHost'),
            POSTGRESQL_DB: importOutput('DatabaseName'),
            CognitoUserPoolID: importOutput('CognitoUserPoolID'),
            S3_BUCKET_AVATARS: importOutput('AvatarsBucketName'),
            S3_BUCKET_DOCUMENTS: importOutput('DocumentsBucketName'),
            POSTGRESQL_USER: "${env:POSTGRESQL_USER}",
            POSTGRESQL_PASSWORD: "${env:POSTGRESQL_PASSWORD}",
            INFRASTRUCTURE_AWS_REGION: "${aws:region}"
        },
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
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
        migration: MigrationLambdaFunction,
        // queue: QueueFunction,
        cognitoPostSignUpFunction,
        cognitoPreSignUpFunction,
    },
    resources: {
        Description: "REINVEST ${sls:stage} API functions",
        Resources: {
            ...CognitoClientResources,
            ...CognitoPreSignUpResources,
            ...CognitoPostSignUpResources,
            ...ApiLambdaResources,
            ...ExplorerLambdaResources,
            ...MigrationLambdaResources,
        },
        Outputs: {
            ...CognitoClientsOutputs,
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
        bundle: {
            ignorePackages: ['pg-native'],
        },
        serverlessTerminationProtection: {
            stages: ["production"],
        },
        outputToEnv: {
            fileName: "./.env.${sls:stage}",
            overwrite: false,
            map: {
                LocalCognitoClientId: "LocalCognitoClientId",
                LocalHostedUiUrl: "LocalHostedUiUrl",
                WebsiteHostedUiUrl: "WebsiteHostedUiUrl",
            }
        },
    },
};

module.exports = serverlessConfiguration;
