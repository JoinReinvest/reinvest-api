import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

export const SegmentFunction = {
  handler: `devops/functions/segment/handler.main`,
  role: 'SegmentRole',
  timeout: 29,
  vpc: {
    securityGroupIds: [getAttribute('SegmentSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      sqs: {
        arn: { 'Fn::GetAtt': ['SQSSegment', 'Arn'] },
        batchSize: 1,
      },
    },
  ],
};

export const SegmentResources = {
  SQSSegment: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${sls:stage}-sqs-segment',
    },
  },
  SegmentRole: {
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
          PolicyName: 'SegmentPolicy',
          PolicyDocument: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
              ...S3PoliciesWithImport,
              ...SQSSendPolicy,
              {
                Effect: 'Allow',
                Action: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:SendMessage', 'sqs:SendMessageBatch'],
                Resource: [{ 'Fn::GetAtt': ['SQSSegment', 'Arn'] }],
              },
            ],
          },
        },
      ],
    },
  },
  SegmentSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-segment-lambda'),
      GroupDescription: getResourceName('sg-segment-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
