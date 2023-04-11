import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';

export const CronVendorsSyncFunction = {
  handler: `devops/functions/cronVendorsSync/handler.main`,
  role: 'CronVendorsSyncRole',
  vpc: {
    securityGroupIds: [getAttribute('CronVendorsSyncSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      schedule: 'rate(1 hour)',
    },
  ],
};

export const CronVendorsSyncResources = {
  CronVendorsSyncRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      AssumeRolePolicyVendors: {
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
          PolicyVendors: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
              ...S3PoliciesWithImport,
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
