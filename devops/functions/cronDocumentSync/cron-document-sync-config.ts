import {getAttribute, getResourceName} from "../../serverless/utils";
import {
    EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules,
} from "../../serverless/vpc";
import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {S3PoliciesWithImport} from "../../serverless/s3";


export const CronDocumentSyncFunction = {
    handler: `devops/functions/cronDocumentSync/handler.main`,
    role: "CronDocumentSyncRole",
    vpc: {
        securityGroupIds: [getAttribute("CronDocumentSyncSecurityGroup", "GroupId")],
        subnetIds: [...importPrivateSubnetRefs()],
    },
    events: [
        {
            schedule: "rate(1 minute)"
        },
    ],
};


export const CronDocumentSyncResources = {
    CronDocumentSyncRole: {
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
                    PolicyName: 'QueuePolicy',
                    PolicyDocument: {
                        Statement: [
                            ...CloudwatchPolicies,
                            ...EniPolicies,
                            ...S3PoliciesWithImport,
                            {
                                Effect: "Allow",
                                Action: [
                                    "lambda:InvokeFunction",
                                ],
                                Resource: "*",
                            },
                        ],
                    },
                },
            ],
        },
    },
    CronDocumentSyncSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: getResourceName("sg-cronDocumentSync-lambda"),
            GroupDescription: getResourceName("sg-cronDocumentSync-lambda"),
            SecurityGroupIngress: SecurityGroupIngressRules,
            SecurityGroupEgress: SecurityGroupEgressRules,
            VpcId: importVpcRef()
        },
    },
};
