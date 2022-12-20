import {getAttribute, getResourceName} from "./utils";

export const CognitoResources = {
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
                SnsCallerArn: getAttribute('CognitoSMSRole', 'Arn'),
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
            Description: "Executives group",
            GroupName: "Executives",
            Precedence: 20,
            UserPoolId: {'Ref': 'CognitoUserPool'},
        }
    },
    CognitoAdministratorsGroup: {
        Type: 'AWS::Cognito::UserPoolGroup',
        Properties: {
            Description: "Administrators group",
            GroupName: "Administrators",
            Precedence: 10,
            UserPoolId: {'Ref': 'CognitoUserPool'},
        }
    },
}


export const CognitoAuthorizer = {
    CognitoAuthorizer: {
        type: "jwt",
        name: getResourceName('cognito-authorizer'),
        identitySource: '$request.header.Authorization',
        issuerUrl: getAttribute('CognitoUserPool', 'ProviderURL'),
        audience: [{Ref: 'CognitoUserPoolClientPostman'}]
    }
}

export const CognitoAuthorizerName = 'CognitoAuthorizer';