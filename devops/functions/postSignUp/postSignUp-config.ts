import {LambdaConfigType} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {getAttribute, getResourceName} from "../..//serverless/utils";
import {EniPolicies, importPrivateSubnetRefs, importVpcRef} from "../..//serverless/vpc";
import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {CognitoUpdateAttributesPolicyBasedOnOutputArn} from "../../serverless/cognito";

const trigger: keyof LambdaConfigType = 'PostConfirmation';

export const cognitoPostSignUpFunction = {
    handler: `devops/functions/postSignUp/handler.main`,
    role: "CognitoPostSignUpLambdaRole",
    vpc: {
        securityGroupIds: [getAttribute("PostSignUpSecurityGroup", "GroupId")],
        subnetIds: [...importPrivateSubnetRefs()],
    },
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
                    PolicyName: 'PostSignUpLambdaPolicy',
                    PolicyDocument: {
                        Statement: [
                            ...CloudwatchPolicies,
                            ...EniPolicies,
                            ...CognitoUpdateAttributesPolicyBasedOnOutputArn,
                        ],
                    },
                },
            ],
        },
    },
    PostSignUpSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: getResourceName("sg-postsignup-lambda"),
            GroupDescription: getResourceName("sg-postsignup-lambda"),
            VpcId: importVpcRef(),
        },
    },
}