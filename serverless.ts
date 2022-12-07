import type {AWS} from '@serverless/typescript';

const serverlessConfiguration: AWS = {
    service: 'LUKASZD',
    frameworkVersion: '3',
    useDotenv: true,
    plugins: ['serverless-offline', 'serverless-offline-sqs','serverless-esbuild'], //  'serverless-domain-manager'
    provider: {
        name: 'aws',
        runtime: 'nodejs16.x',
        region: 'eu-west-2',
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
            SERVERLESS_SERVICE: '${self:service}',
            SERVERLESS_ACCOUNT_ID: '${aws:accountId}',
            SERVERLESS_STAGE: '${sls:stage}',
            SERVERLESS_REGION: '${aws:region}',
            // DB_USERNAME: '${env:DB_USERNAME}',
            // DB_HOST: '${env:DB_HOST}',
            // DB_PASSWORD: '${env:DB_PASSWORD}',
            // DB_LOGGING: '${env:DB_LOGGING}',
            // COGNITO_USER_POOL_ID: '${env:COGNITO_USER_POOL_ID}',
            // COGNITO_USER_POOL_DOMAIN: '${env:COGNITO_USER_POOL_DOMAIN}',
            // COGNITO_CLIENT_IDS: '${env:COGNITO_CLIENT_IDS}',
            // LOGGER_LEVEL: '${env:LOGGER_LEVEL}',
            // CDN_DOMAIN: '${env:CDN_DOMAIN}',
            // API_DOMAIN: '${env:API_DOMAIN}',
        },
    },
    functions: {
        api: {
            handler: `devops/api/handler.main`,
            role: 'ApiLambdaRole',
            timeout: 10,
            events: [
                {
                    httpApi: {
                        method: 'GET',
                        path: '/',
                    },
                }
            ],
        }
    },
    resources: {
        Resources: {
            ApiLambdaRole: {
                Type: 'AWS::IAM::Role',
                Properties: {
                    AssumeRolePolicyDocument: {
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: 'sts:AssumeRole',
                                Principal: {
                                    Service: 'lambda.amazonaws.com',
                                },
                            },
                        ],
                    },
                    Policies: [
                        {
                            PolicyName: 'ApiLambdaPolicy',
                            PolicyDocument: {
                                Statement: [
                                    {
                                        Effect: 'Allow',
                                        Action: ['logs:CreateLogStream', 'logs:CreateLogGroup', 'logs:PutLogEvents'],
                                        Resource: 'arn:aws:logs:*:*:*',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        }
    },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node16',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
    }

};


module.exports = serverlessConfiguration;