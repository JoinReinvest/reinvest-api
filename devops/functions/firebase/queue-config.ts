import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

export const FirebaseFunction = {
  handler: `devops/functions/firebase/handler.main`,
  role: 'FirebaseRole',
  timeout: 30,
  vpc: {
    securityGroupIds: [getAttribute('FirebaseSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      sqs: {
        arn: { 'Fn::GetAtt': ['SQSFirebase', 'Arn'] },
        batchSize: 1,
      },
    },
  ],
};

export const FirebaseResources = {
  SQSFirebase: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${sls:stage}-sqs-firebase',
    },
  },
  FirebaseRole: {
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
          PolicyName: 'FirebasePolicy',
          PolicyDocument: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
              ...S3PoliciesWithImport,
              ...SQSSendPolicy,
              {
                Effect: 'Allow',
                Action: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:SendMessage', 'sqs:SendMessageBatch'],
                Resource: [{ 'Fn::GetAtt': ['SQSFirebase', 'Arn'] }],
              },
            ],
          },
        },
      ],
    },
  },
  FirebaseSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-firebase-lambda'),
      GroupDescription: getResourceName('sg-firebase-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
