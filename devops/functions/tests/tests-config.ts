import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {getAttribute, getResourceName} from "../../serverless/utils";
import {EniPolicies, importPrivateSubnetRefs, importVpcRef} from "../../serverless/vpc";

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
            SecurityGroupEgress: [
                {
                    IpProtocol: "TCP",
                    CidrIp: "0.0.0.0/0",
                    ToPort: 443,
                    FromPort: 443,
                },
                {
                    IpProtocol: "TCP",
                    CidrIp: "0.0.0.0/0",
                    ToPort: 5432,
                    FromPort: 5432,
                },
            ],
            VpcId: importVpcRef()
        },
    },
};
