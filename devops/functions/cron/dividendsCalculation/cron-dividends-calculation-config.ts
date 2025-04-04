import { CloudwatchPolicies } from '../../../serverless/cloudwatch';
import { getAttribute, getResourceName } from '../../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../../serverless/vpc';
import { SQSSendPolicy } from '../../queue/queue-config';

export const CronDividendsCalculationFunction = {
  handler: `devops/functions/cron/dividendsCalculation/handler.main`,
  role: 'CronDividendsCalculationRole',
  timeout: 60,
  vpc: {
    securityGroupIds: [getAttribute('CronDividendsCalculationSecurityGroup', 'GroupId')],
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

export const CronDividendsCalculationResources = {
  CronDividendsCalculationRole: {
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
          PolicyName: 'DividendsCalculationPolicy',
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
  CronDividendsCalculationSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-cronDividendsCalculation-lambda'),
      GroupDescription: getResourceName('sg-cronDividendsCalculation-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
