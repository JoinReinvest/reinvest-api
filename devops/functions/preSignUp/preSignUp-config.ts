import {getAttribute, getResourceName} from "../../serverless/utils";
import {
    EniPolicies,
    importPrivateSubnetRefs,
    importVpcRef,
    SecurityGroupEgressRules,
    SecurityGroupIngressRules
} from "../../serverless/vpc";
import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {LambdaConfigType} from "@aws-sdk/client-cognito-identity-provider";

const trigger: keyof LambdaConfigType = 'PreSignUp';

export const cognitoPreSignUpFunction = {
    handler: `devops/functions/preSignUp/handler.main`,
    role: "CognitoPreSignUpLambdaRole",
    vpc: {
        securityGroupIds: [getAttribute("PreSignUpSecurityGroup", "GroupId")],
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
                    PolicyName: "PreSignUpLambdaPolicy",
                    PolicyDocument: {
                        Statement: [
                            ...CloudwatchPolicies,
                            ...EniPolicies
                        ],
                    },
                },
            ],
        },
    },
    PreSignUpSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: getResourceName("sg-presignup-lambda"),
            GroupDescription: getResourceName("sg-presignup-lambda"),
            SecurityGroupIngress: SecurityGroupIngressRules,
            SecurityGroupEgress: SecurityGroupEgressRules,
            VpcId: importVpcRef(),
        },
    },
}