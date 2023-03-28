import {exportOutput, getAttribute, getResourceName, joinAttributes} from "../../serverless/utils";
import {
    EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules,
} from "../../serverless/vpc";
import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {S3PoliciesWithImport} from "devops/serverless/s3";
import {CognitoUpdateAttributesPolicyBasedOnOutputArn} from "devops/serverless/cognito";
import {SMSPolicy} from "devops/serverless/sns";

export const QueueFunction = {
    handler: `devops/functions/queue/handler.main`,
    role: "QueueRole",
    vpc: {
        securityGroupIds: [getAttribute("InboxSecurityGroup", "GroupId")],
        subnetIds: [...importPrivateSubnetRefs()],
    },
    events: [
        {
            sqs: {
                arn: {'Fn::GetAtt': ['SQSNotification', 'Arn']},
                batchSize: 1,
            },
        },
    ],
};

export const SQSSendPolicy = [
    {
        Effect: "Allow",
        Action: [
            "sqs:SendMessage",
        ],
        Resource: "arn:aws:sqs:us-east-1:*:*",
    },
];

export const QueueResources = {
    SQSNotification: {
        Type: 'AWS::SQS::Queue',
        Properties: {
            QueueName: '${sls:stage}-sqs-notification',
        },
    },
    QueueRole: {
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
                            ...CloudwatchPolicies,
                            ...EniPolicies,
                            ...S3PoliciesWithImport,
                            ...CognitoUpdateAttributesPolicyBasedOnOutputArn,
                            SMSPolicy,
                            {
                                Effect: 'Allow',
                                Action: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:SendMessage', 'sqs:SendMessageBatch'],
                                Resource: [
                                    {'Fn::GetAtt': ['SQSNotification', 'Arn']}
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    },
    InboxSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: getResourceName("sg-inbox-lambda"),
            GroupDescription: getResourceName("sg-inbox-lambda"),
            SecurityGroupIngress: SecurityGroupIngressRules,
            SecurityGroupEgress: SecurityGroupEgressRules,
            VpcId: importVpcRef()
        },
    },
};
export const QueueOutputs = {
    SQSQueueUrl: {
        Value: getAttribute("SQSNotification", "QueueUrl"),
        Description: "SQS Queue Url",
        ...exportOutput("SQSQueueUrl"),
    }
}
