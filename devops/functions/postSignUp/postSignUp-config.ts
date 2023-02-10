import {LambdaConfigType} from 'aws-sdk/clients/cognitoidentityserviceprovider';

const trigger: keyof LambdaConfigType = 'PostConfirmation';

export const cognitoPostSignUpFunction = {
    handler: `devops/functions/postSignUp/handler.main`,
    role: "CognitoPostSignUpLambdaRole",
    events: [{
        cognitoUserPool: {
            pool: "reinvest-user-pool-${sls:stage}",
            trigger,
            existing: true,
        },
    }],
};
export const CognitoPostSignUpResources = {
    CognitoPostSignUpLambdaRole: {
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
                            // {
                            //     Effect: 'Allow',
                            //     Action: ['cognito-idp:AdminUpdateUserAttributes'],
                            //     Resource: [CognitoUserPoolArn],
                            // },
                        ],
                    },
                },
            ],
        },
    },
}