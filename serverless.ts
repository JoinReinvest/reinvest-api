import type {AWS} from '@serverless/typescript';

const serverlessConfiguration: AWS = {
    service: '${env:APPLICATION_NAME}',
    frameworkVersion: '3',
    useDotenv: true,
    plugins: ['serverless-offline', 'serverless-offline-sqs', 'serverless-esbuild'], //  'serverless-domain-manager'
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
        logs: {
            httpApi: false, // turn on Api Gateway logs
            metrics: true,
        },
        httpApi: {
            cors: true,
            authorizers: {
                CognitoAuthorizer: {
                    type: 'jwt',
                    identitySource: '$request.header.Authorization',
                    issuerUrl: {'Fn::GetAtt': ['CognitoUserPool', 'ProviderURL']},
                    audience: [
                        {Ref: 'CognitoUserPoolClientPostman'}
                    ]
                }
            }
        },
        iam: {
            role: {
                statements: [
                    {
                        Effect: 'Allow',
                        Action: [
                            'cloudwatch:*',
                            'logs:*'
                        ],
                        Resource: "*"
                    }
                ]
            }
        }
    },
    functions: {
        api: {
            handler: `devops/api/handler.main`,
            role: 'ApiLambdaRole',
            timeout: 10,
            events: [
                {
                    httpApi: {
                        method: 'ANY',
                        path: '/',
                        authorizer: {
                            name: 'CognitoAuthorizer'
                        }
                    },
                }
            ],
        }
    },
    resources: {
        Resources: {
            CognitoSMSRole: {
                Type: 'AWS::IAM::Role',
                Properties: {
                    AssumeRolePolicyDocument: {
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: 'sts:AssumeRole',
                                Principal: {
                                    Service: 'cognito-idp.amazonaws.com',
                                },
                                Condition: {
                                    StringEquals: {
                                        "sts:ExternalId": '${self:service}-user-pool-${sls:stage}-external-id',
                                    },
                                },
                            },
                        ],
                    },
                    Policies: [
                        {
                            PolicyName: 'CognitoSendSMS',
                            PolicyDocument: {
                                Statement: [
                                    {
                                        Effect: 'Allow',
                                        Action: ['sns:Publish'],
                                        Resource: '*'
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
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
            CognitoUserPool: {
                Type: 'AWS::Cognito::UserPool',
                DeletionPolicy: '${env:COGNITO_RETENTION_POLICY}', // Retain for prod, Delete for staging
                Properties: {
                    UserPoolName: '${self:service}-user-pool-${sls:stage}',
                    UsernameAttributes: ['email'],
                    Policies: {
                        PasswordPolicy: {
                            MinimumLength: 8,
                            RequireLowercase: false,
                            RequireNumbers: true,
                            RequireSymbols: false,
                            RequireUppercase: true,
                        },
                    },
                    MfaConfiguration: 'OPTIONAL',
                    AccountRecoverySetting: {
                        RecoveryMechanisms: [
                            {
                                Name: 'verified_phone_number',
                                Priority: 1,
                            },
                        ],
                    },
                    AutoVerifiedAttributes: ['phone_number'],
                    UserAttributeUpdateSettings: {
                        AttributesRequireVerificationBeforeUpdate: ['phone_number'],
                    },
                    DeviceConfiguration: {
                        ChallengeRequiredOnNewDevice: true,
                    },
                    SmsConfiguration: {
                        ExternalId: '${self:service}-user-pool-${sls:stage}-external-id',
                        SnsCallerArn: {
                            "Fn::GetAtt": ['CognitoSMSRole', 'Arn']
                        }
                    },
                    Schema: [
                        {
                            AttributeDataType: 'String',
                            Mutable: true,
                            Name: 'email',
                            Required: true,
                        },
                        {
                            AttributeDataType: 'String',
                            Mutable: true,
                            Name: 'phone_number',
                            Required: true,
                        },
                    ],
                    UserPoolAddOns: {
                        AdvancedSecurityMode: 'ENFORCED',
                    },
                },
            },
            CognitoUserPoolClientPostman: {
                Type: 'AWS::Cognito::UserPoolClient',
                Properties: {
                    TokenValidityUnits: {
                        AccessToken: 'hours',
                        IdToken: 'hours',
                        RefreshToken: 'days',
                    },
                    AccessTokenValidity: 8,
                    IdTokenValidity: 8,
                    RefreshTokenValidity: 30,
                    AllowedOAuthFlows: ['implicit'],
                    AllowedOAuthScopes: ['email', 'openid', 'profile'],
                    CallbackURLs: ['http://localhost'],
                    ClientName: 'Postman Test Client',
                    EnableTokenRevocation: true,
                    PreventUserExistenceErrors: 'ENABLED',
                    ExplicitAuthFlows: ['ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
                    GenerateSecret: false,
                    SupportedIdentityProviders: ['COGNITO'],
                    AllowedOAuthFlowsUserPoolClient: true,
                    UserPoolId: {
                        Ref: 'CognitoUserPool',
                    },
                },
            },
            CognitoUserPoolDomain: {
                Type: 'AWS::Cognito::UserPoolDomain',
                Properties: {
                    Domain: '${self:service}-${sls:stage}',
                    UserPoolId: {
                        Ref: 'CognitoUserPool',
                    },
                },
            },
            CognitoUserPoolRiskConfigurationAttachment: {
                Type: 'AWS::Cognito::UserPoolRiskConfigurationAttachment',
                Properties: {
                    ClientId: 'ALL',
                    AccountTakeoverRiskConfiguration: {
                        Actions: {
                            HighAction: {
                                EventAction: 'BLOCK',
                                Notify: true
                            },
                            MediumAction: {
                                EventAction: 'MFA_REQUIRED',
                                Notify: true
                            },
                            LowAction: {
                                EventAction: 'MFA_IF_CONFIGURED',
                                Notify: true
                            },
                        },
                    },
                    CompromisedCredentialsRiskConfiguration: {
                        Actions: {
                            EventAction: 'BLOCK'
                        },
                    },
                    UserPoolId: {
                        Ref: 'CognitoUserPool'
                    }
                },
            },
            CognitoExecutivesGroup: {
                Type: 'AWS::Cognito::UserPoolGroup',
                Properties: {
                    Description : "Executives group",
                    GroupName : "Executives",
                    Precedence : 20,
                    UserPoolId : {'Ref': 'CognitoUserPool'},
                }
            },
            CognitoAdministratorsGroup: {
                Type: 'AWS::Cognito::UserPoolGroup',
                Properties: {
                    Description : "Administrators group",
                    GroupName : "Administrators",
                    Precedence : 10,
                    UserPoolId : {'Ref': 'CognitoUserPool'},
                }
            }
        }
    },
    package: {individually: true},
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node16',
            define: {'require.resolve': undefined},
            platform: 'node',
            concurrency: 10,
        },
    }

};

module.exports = serverlessConfiguration;