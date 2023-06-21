import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

export const PdfGeneratorFunction = {
  handler: `devops/functions/pdfGenerator/handler.main`,
  // layers: [{ Ref: 'ChromiumLambdaLayer' }],
  role: 'PdfGeneratorRole',
  timeout: 30,
  vpc: {
    securityGroupIds: [getAttribute('PdfGeneratorSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      sqs: {
        arn: { 'Fn::GetAtt': ['SQSPdfGenerator', 'Arn'] },
        batchSize: 1,
      },
    },
  ],
};

export const PdfGeneratorResources = {
  SQSPdfGenerator: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${sls:stage}-sqs-pdf-generator',
    },
  },
  PdfGeneratorRole: {
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
          PolicyName: 'PdfGeneratorPolicy',
          PolicyDocument: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
              ...S3PoliciesWithImport,
              ...SQSSendPolicy,
              {
                Effect: 'Allow',
                Action: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:SendMessage', 'sqs:SendMessageBatch'],
                Resource: [{ 'Fn::GetAtt': ['SQSPdfGenerator', 'Arn'] }],
              },
            ],
          },
        },
      ],
    },
  },
  PdfGeneratorSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-pdf-generator-lambda'),
      GroupDescription: getResourceName('sg-pdf-generator-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
