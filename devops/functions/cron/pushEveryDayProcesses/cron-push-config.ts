import { CloudwatchPolicies } from '../../../serverless/cloudwatch';
import { getAttribute, getResourceName } from '../../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../../serverless/vpc';
import { SQSSendPolicy } from '../../queue/queue-config';

export const CronPushEveryDayFunction = {
  handler: `devops/functions/cron/pushEveryDayProcesses/handler.main`,
  role: 'CronPushRole',
  timeout: 60,
  vpc: {
    securityGroupIds: [getAttribute('CronPushSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      schedule: {
        rate: ['rate(3 hours)'],
        enabled: process.env?.DISABLE_CRON ? false : true,
      },
    },
  ],
};

export const CronPushEveryDayResources = {
  CronPushRole: {
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
          PolicyName: 'PushPolicy',
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
  CronPushSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-cronPush-lambda'),
      GroupDescription: getResourceName('sg-cronPush-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
