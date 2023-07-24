import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { CognitoUpdateAttributesPolicyBasedOnOutputArn } from '../../serverless/cognito';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { SMSPolicy } from '../../serverless/sns';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';

export const QueueFunction = {
  handler: `devops/functions/queue/handler.main`,
  role: 'QueueRole',
  timeout: 120,
  vpc: {
    securityGroupIds: [getAttribute('InboxSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      sqs: {
        arn: { 'Fn::GetAtt': ['SQSNotification', 'Arn'] },
        batchSize: 1,
      },
    },
  ],
};

export const SQSSendPolicy = [
  {
    Effect: 'Allow',
    Action: ['sqs:SendMessage'],
    Resource: 'arn:aws:sqs:us-east-1:*:*',
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
              ...S3PoliciesWithImport,
              ...CognitoUpdateAttributesPolicyBasedOnOutputArn,
              SMSPolicy,
              ...SQSSendPolicy,
              {
                Effect: 'Allow',
                Action: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:SendMessage', 'sqs:SendMessageBatch'],
                Resource: [{ 'Fn::GetAtt': ['SQSNotification', 'Arn'] }],
              },
            ],
          },
        },
      ],
    },
  },
  InboxSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-inbox-lambda'),
      GroupDescription: getResourceName('sg-inbox-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
