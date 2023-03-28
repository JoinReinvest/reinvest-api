import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {getAttribute, getResourceName, importOutput} from "../../serverless/utils";
import {
    EniPolicies,
    importPrivateSubnetRefs,
    importVpcRef,
    SecurityGroupEgressRules, SecurityGroupIngressRules
} from "../../serverless/vpc";
import {SQSSendPolicy} from "../queue/queue-config";
import {S3PoliciesWithImport} from "devops/serverless/s3";
import {CognitoUpdateAttributesPolicyBasedOnOutputArn} from "devops/serverless/cognito";
import {SMSPolicy} from "devops/serverless/sns";

export const TestsFunction = {
    handler: `devops/functions/tests/handler.main`,
    role: "TestsLambdaRole",
    timeout: 10,
    vpc: {
        securityGroupIds: [getAttribute("TestsSecurityGroup", "GroupId")],
        subnetIds: [...importPrivateSubnetRefs()],
    },
    events: [
        {
            httpApi: {
                method: "POST",
                path: "/tests/{proxy+}",
            },
        },
    ],
};

export const TestsLambdaResources = {
    TestsLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
            RoleName: getResourceName("TestsLambdaRole"),
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
                    PolicyName: "TestsLambdaPolicy",
                    PolicyDocument: {
                        Statement: [
                            ...CloudwatchPolicies,
                            ...EniPolicies,
                            ...S3PoliciesWithImport,
                            ...CognitoUpdateAttributesPolicyBasedOnOutputArn,
                            ...SQSSendPolicy,
                            SMSPolicy,
                            {
                                Effect: "Allow",
                                Action: [
                                    "cognito-idp:AdminCreateUser",
                                ],
                                Resource: importOutput('CognitoUserPoolArn'),
                            },
                        ],
                    },
                },
            ],
        },
    },
    TestsSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: getResourceName("sg-tests-lambda"),
            GroupDescription: getResourceName("sg-tests-lambda"),
            SecurityGroupIngress: SecurityGroupIngressRules,
            SecurityGroupEgress: SecurityGroupEgressRules,
            VpcId: importVpcRef()
        },
    },
};
