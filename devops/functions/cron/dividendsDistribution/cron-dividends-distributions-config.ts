import { CloudwatchPolicies } from '../../../serverless/cloudwatch';
import { getAttribute, getResourceName } from '../../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../../serverless/vpc';

export const CronDividendsDistributionFunction = {
  handler: `devops/functions/cron/dividendsDistribution/handler.main`,
  role: 'CronDividendsDistributionRole',
  timeout: 60,
  vpc: {
    securityGroupIds: [getAttribute('CronDividendsDistributionSecurityGroup', 'GroupId')],
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

export const CronDividendsDistributionResources = {
  CronDividendsDistributionRole: {
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
          PolicyName: 'DividendsDistributionPolicy',
          PolicyDocument: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
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
  CronDividendsDistributionSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-cronDividendsDistribution-lambda'),
      GroupDescription: getResourceName('sg-cronDividendsDistribution-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
