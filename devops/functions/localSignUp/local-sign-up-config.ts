import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {getResourceName} from "../../serverless/utils";

export const LocalSignUpLambdaFunction = {
    handler: `devops/functions/localSignUp/handler.main`,
    role: "LocalSignUpLambdaRole",
    timeout: 10,
    events: [
        {
            httpApi: {
                method: "POST",
                path: "/local-sign-up",
            },
        },
    ],
};

export const LocalSignUpLambdaResources = {
    LocalSignUpLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
            RoleName: getResourceName("LocalSignUpLambdaRole"),
            AssumeRolePolicyDocument: {
                Statement: [
                    {
                        Effect: "Allow",
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "lambda.amazonaws.com",
                        },
                    },
                ],
            },
            Policies: [
                {
                    PolicyName: "LocalSignUpLambdaPolicy",
                    PolicyDocument: {
                        Statement: [...CloudwatchPolicies],
                    },
                },
            ],
        },
    },
};
