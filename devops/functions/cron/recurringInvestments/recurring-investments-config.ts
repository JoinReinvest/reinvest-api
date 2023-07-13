import { CloudwatchPolicies } from '../../../serverless/cloudwatch';
import { getAttribute, getResourceName } from '../../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../../serverless/vpc';
import { SQSSendPolicy } from '../../queue/queue-config';

export const CronRecurringInvestmentsFunction = {
  handler: `devops/functions/cron/recurringInvestments/handler.main`,
  role: 'CronRecurringInvestmentsRole',
  timeout: 60,
  vpc: {
    securityGroupIds: [getAttribute('CronRecurringInvestmentsSecurityGroup', 'GroupId')],
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

export const CronRecurringInvestmentsResources = {
  CronRecurringInvestmentsRole: {
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
          PolicyName: 'RecurringInvestmentsPolicy',
          PolicyDocument: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
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
  CronRecurringInvestmentsSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-cronRecurringInvestments-lambda'),
      GroupDescription: getResourceName('sg-cronRecurringInvestments-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
