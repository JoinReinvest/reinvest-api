import {LambdaConfigType} from 'aws-sdk/clients/cognitoidentityserviceprovider';

const trigger: keyof LambdaConfigType = 'PreSignUp';

export const cognitoPreSignUpFunction = {
    handler: `devops/functions/preSignUp/handler.main`,
    role: "CognitoPreSignUpLambdaRole",
    events: [{
        cognitoUserPool: {
            pool: "${self:service}-user-pool-${sls:stage}",
            trigger,
            existing: true,
        },
    }],
};
export const CognitoPreSignUpResources = {
    CognitoPreSignUpLambdaRole: {
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