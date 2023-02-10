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

const serverlessConfiguration: AWS = {
    service: "reinvest-functions",
    frameworkVersion: "3",
    useDotenv: true,
    plugins: [
        "serverless-dotenv-plugin",
        "serverless-stack-termination-protection",
        "serverless-esbuild",
    ],
    // @ts-ignore
    provider: {
        ...ProviderConfiguration,
        environment: {
            ...ProviderEnvironment,
            ...CognitoEnvs,
            ApiUrl: margeWithApiGatewayUrl('/api')
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
        // queue: QueueFunction,
        // cognitoPostSignUpFunction,
        cognitoPreSignUpFunction,
    },
    resources: {
        Description: "REINVEST ${sls:stage} API functions",
        Resources: {
            ...CognitoClientResources,
            ...CognitoPreSignUpResources,
            // ...CognitoPostSignUpResources,
            ...ApiLambdaResources,
            ...ExplorerLambdaResources,
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
    },
};

module.exports = serverlessConfiguration;
