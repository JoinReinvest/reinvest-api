import { CloudwatchPolicies } from '../../../serverless/cloudwatch';
import { S3PoliciesWithImport } from '../../../serverless/s3';
import { getAttribute, getResourceName } from '../../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../../serverless/vpc';
import { SQSSendPolicy } from '../../queue/queue-config';

export const CronVendorsSyncFunction = {
  handler: `devops/functions/cron/vendorsSync/handler.main`,
  role: 'CronVendorsSyncRole',
  timeout: 30,
  vpc: {
    securityGroupIds: [getAttribute('CronVendorsSyncSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      schedule: {
        rate: ['rate(1 hour)'],
        enabled: process.env?.DISABLE_CRON ? false : true,
      },
    },
  ],
};

export const CronVendorsSyncResources = {
  CronVendorsSyncRole: {
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
              ...SQSSendPolicy,
              {
                Effect: 'Allow',
                Action: ['lambda:InvokeFunction'],
                Resource: '*',
              },
            ],
          },
        },
      ],
    },
  },
  CronVendorsSyncSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-cronVendorsSync-lambda'),
      GroupDescription: getResourceName('sg-cronVendorsSync-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
