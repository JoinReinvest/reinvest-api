import {exportOutput, getAttribute, getResourceName, importOutput} from "./utils";
import {margeWithApiGatewayUrl} from "./serverless-common";

// SAAS Part
export const CognitoResources = {
    CognitoSMSRole: {
        Type: "AWS::IAM::Role",
        Properties: {
            AssumeRolePolicyDocument: {
                Statement: [
                    {
                        Effect: "Allow",
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "cognito-idp.amazonaws.com",
                        },
                        Condition: {
                            StringEquals: {
                                "sts:ExternalId":
                                    "reinvest-user-pool-${sls:stage}-external-id",
                            },
                        },
                    },
                ],
            },
            Policies: [
                {
                    PolicyName: "CognitoSendSMS",
                    PolicyDocument: {
                        Statement: [
                            {
                                Effect: "Allow",
                                Action: ["sns:Publish"],
                                Resource: "*",
                            },
                        ],
                    },
                },
            ],
        },
    },
    CognitoUserPool: {
        Type: "AWS::Cognito::UserPool",
        DeletionPolicy: "${env:COGNITO_RETENTION_POLICY}", // Retain for prod, Delete for staging
        Properties: {
            UserPoolName: "reinvest-user-pool-${sls:stage}",
            UsernameAttributes: ["email"],
            Policies: {
                PasswordPolicy: {
                    MinimumLength: 8,
                    RequireLowercase: false,
                    RequireNumbers: true,
                    RequireSymbols: false,
                    RequireUppercase: true,
                },
            },
            MfaConfiguration: "OPTIONAL",
            AccountRecoverySetting: {
                RecoveryMechanisms: [
                    {
                        Name: "verified_email",
                        Priority: 1,
                    },
                ],
            },
            AutoVerifiedAttributes: ["email"],
            UserAttributeUpdateSettings: {
                AttributesRequireVerificationBeforeUpdate: ["email"],
            },
            DeviceConfiguration: {
                ChallengeRequiredOnNewDevice: true,
            },
            SmsConfiguration: {
                ExternalId: "reinvest-user-pool-${sls:stage}-external-id",
                SnsCallerArn: getAttribute("CognitoSMSRole", "Arn"),
            },
            EnabledMfas: [
                "SMS_MFA"
            ],
            Schema: [
                {
                    AttributeDataType: "String",
                    Mutable: true,
                    Name: "email",
                    Required: true,
                },
                {
                    AttributeDataType: "String",
                    Mutable: true,
                    Name: "phone_number",
                    Required: false,
                },
                {
                    AttributeDataType: "String",
                    Mutable: false,
                    Name: "incentive_token",
                    Required: false,
                },
            ],
            UserPoolAddOns: {
                AdvancedSecurityMode: "ENFORCED",
            },
        },
    },
    CognitoUserPoolDomain: {
        Type: "AWS::Cognito::UserPoolDomain",
        Properties: {
            Domain: "reinvest-${sls:stage}",
            UserPoolId: {
                Ref: "CognitoUserPool",
            },
        },
    },
    CognitoUserPoolRiskConfigurationAttachment: {
        Type: "AWS::Cognito::UserPoolRiskConfigurationAttachment",
        Properties: {
            ClientId: "ALL",
            AccountTakeoverRiskConfiguration: {
                Actions: {
                    HighAction: {
                        EventAction: "BLOCK",
                        Notify: true,
                    },
                    MediumAction: {
                        EventAction: "MFA_REQUIRED",
                        Notify: true,
                    },
                    LowAction: {
                        EventAction: "MFA_IF_CONFIGURED",
                        Notify: true,
                    },
                },
            },
            CompromisedCredentialsRiskConfiguration: {
                Actions: {
                    EventAction: "BLOCK",
                },
            },
            UserPoolId: {
                Ref: "CognitoUserPool",
            },
        },
    },
    CognitoExecutivesGroup: {
        Type: "AWS::Cognito::UserPoolGroup",
        Properties: {
            Description: "Executives group",
            GroupName: "Executives",
            Precedence: 20,
            UserPoolId: {Ref: "CognitoUserPool"},
        },
    },
    CognitoAdministratorsGroup: {
        Type: "AWS::Cognito::UserPoolGroup",
        Properties: {
            Description: "Administrators group",
            GroupName: "Administrators",
            Precedence: 10,
            UserPoolId: {Ref: "CognitoUserPool"},
        },
    },
};
export const CognitoOutputs = {
    CognitoUserPoolID: {
        Value: {Ref: "CognitoUserPool"},
        Description: "The user pool ID",
        ...exportOutput('CognitoUserPoolID')
    },
    CognitoIssuerUrl: {
        Value: getAttribute("CognitoUserPool", "ProviderURL"),
        Description: "CognitoIssuerUrl",
        ...exportOutput('CognitoIssuerUrl')
    },
}
export const CognitoAuthorizer = {
    CognitoAuthorizer: {
        type: "jwt",
        name: getResourceName("cognito-authorizer"),
        identitySource: "$request.header.Authorization",
        issuerUrl: importOutput('CognitoIssuerUrl'),
        audience: [{Ref: "CognitoUserPoolClientPostman"}],
    },
};

// FUNCTIONS Part
export const getHostedUI = (clientName: string) => ({
    "Fn::Sub": [
        "https://reinvest-${sls:stage}.auth.${aws:region}.amazoncognito.com/login?client_id=${CognitoUserPoolClientPostmanClientId}&response_type=token&scope=openid+profile&redirect_uri=${CallbackUrl}",
        {
            CognitoUserPoolClientPostmanClientId: {Ref: clientName},
            CallbackUrl: margeWithApiGatewayUrl("/set-header")
        }
    ]
});
export const CognitoClientResources = {
    CognitoUserPoolClientPostman: {
        Type: "AWS::Cognito::UserPoolClient",
        Properties: {
            TokenValidityUnits: {
                AccessToken: "hours",
                IdToken: "hours",
                RefreshToken: "days",
            },
            AccessTokenValidity: 8,
            IdTokenValidity: 8,
            RefreshTokenValidity: 30,
            AllowedOAuthFlows: ["implicit"],
            AllowedOAuthScopes: ["profile", "openid"],
            CallbackURLs: [margeWithApiGatewayUrl("/set-header")],
            ClientName: "Postman Test Client",
            EnableTokenRevocation: true,
            PreventUserExistenceErrors: "ENABLED",
            ExplicitAuthFlows: [
                "ALLOW_USER_PASSWORD_AUTH",
                "ALLOW_REFRESH_TOKEN_AUTH",
            ],
            GenerateSecret: false,
            SupportedIdentityProviders: ["COGNITO"],
            AllowedOAuthFlowsUserPoolClient: true,
            UserPoolId: importOutput('CognitoUserPoolID'),
            // WriteAttributes: [
            //     'custom:incentive_token',
            // ]
        },
    },
}
export const CognitoClientsOutputs = {
    CognitoUserPoolClientPostmanClientId: {
        Value: {Ref: "CognitoUserPoolClientPostman"},
        Description: "The app client",
        ...exportOutput('CognitoUserPoolClientPostmanClientId')
    },
    CognitoHostedUiUrl: {
        Value: getHostedUI('CognitoUserPoolClientPostman'),
        Description: "The hosted UI URL",
        ...exportOutput('CognitoHostedUiUrl')
    },
}
export const CognitoEnvs = {
    ExplorerHostedUI: getHostedUI('CognitoUserPoolClientPostman'),
}
export const CognitoAuthorizerName = "CognitoAuthorizer";