import {getAttribute, getResourceName} from "../../serverless/utils";
import {
    EniPolicies,
    importPrivateSubnetRefs,
    importVpcRef,
    SecurityGroupEgressRules,
    SecurityGroupIngressRules
} from "../../serverless/vpc";
import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {CognitoUpdateAttributesPolicyBasedOnOutputArn} from "../../serverless/cognito";
import {SQSSendPolicy} from "../queue/queue-config";

const cognitoUserPool: {
    cognitoUserPool: {
        pool: string;
        trigger: "PostConfirmation";
        existing?: boolean;
        forceDeploy?: boolean;
    };
} = {
    cognitoUserPool: {
        pool: "reinvest-user-pool-${sls:stage}",
        trigger: "PostConfirmation",
        existing: true,
        forceDeploy: true
    },
}

export const cognitoPostSignUpFunction = {
    handler: `devops/functions/postSignUp/handler.main`,
    role: "CognitoPostSignUpLambdaRole",
    vpc: {
        securityGroupIds: [getAttribute("PostSignUpSecurityGroup", "GroupId")],
        subnetIds: [...importPrivateSubnetRefs()],
    },
    events: [cognitoUserPool],
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
                            ...SQSSendPolicy,
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
            SecurityGroupIngress: SecurityGroupIngressRules,
            SecurityGroupEgress: SecurityGroupEgressRules,
            VpcId: importVpcRef(),
        },
    },
}