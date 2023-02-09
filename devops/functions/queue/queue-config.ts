import { CloudwatchPolicies } from "../../serverless/cloudwatch";
import { CognitoAuthorizerName } from "../../serverless/cognito";
import { S3PoliciesWithImport } from "../../serverless/s3";
import { getAttribute, getResourceName } from "../../serverless/utils";
import {
  EniPolicies,
  getPrivateSubnetRefs,
  getVpcRef,
} from "../../serverless/vpc";

export const QueueFunction = {
  handler: `devops/functions/queue/handler.main`,
  role: "QueueRole",
  // vpc: {
  //   securityGroupIds: [getAttribute("ApiSecurityGroup", "GroupId")],
  //   subnetIds: [...getPrivateSubnetRefs()],
  // },
  events: [
    {
      sqs: {
        arn: { 'Fn::GetAtt': ['SQSNotification', 'Arn'] },
        batchSize: 1,
      },
    },
  ],
};

export const QueueResources = {
  SQSNotification: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: 'notification',
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
              {
                Effect: 'Allow',
                Action: ['logs:CreateLogStream', 'logs:CreateLogGroup', 'logs:PutLogEvents'],
                Resource: 'arn:aws:logs:*:*:*',
              },
              {
                Effect: 'Allow',
                Action: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:SendMessage', 'sqs:SendMessageBatch'],
                Resource: [
                  { 'Fn::GetAtt': ['SQSNotification', 'Arn'] }
                ],
              },
            ],
          },
        },
      ],
    },
  }
};
