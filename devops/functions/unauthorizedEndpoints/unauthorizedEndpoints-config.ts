import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { SESSendPolicy } from '../../serverless/ses';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

export const UnauthorizedEndpointsFunction = {
  handler: `devops/functions/unauthorizedEndpoints/handler.main`,
  role: 'UnauthorizedEndpointsLambdaRole',
  timeout: 10,
  vpc: {
    securityGroupIds: [getAttribute('UnauthorizedEndpointsSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      httpApi: {
        method: 'POST',
        path: '/incentive-token',
      },
    },
    {
      httpApi: {
        method: 'POST',
        path: '/webhooks/{proxy+}',
      },
    },
    {
      httpApi: {
        method: 'POST',
        path: '/calculations',
      },
    },
    {
      httpApi: {
        method: 'POST',
        path: '/calculations/{proxy+}',
      },
    },
  ],
};

export const UnauthorizedEndpointsLambdaResources = {
  UnauthorizedEndpointsLambdaRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: getResourceName('UnauthorizedEndpointsLambdaRole'),
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
          PolicyName: 'UnauthorizedEndpointsLambdaPolicy',
          PolicyDocument: {
            Statement: [...CloudwatchPolicies, ...EniPolicies, ...SQSSendPolicy, ...SESSendPolicy],
          },
        },
      ],
    },
  },
  UnauthorizedEndpointsSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-unauthorizedEndpoints-lambda'),
      GroupDescription: getResourceName('sg-unauthorizedEndpoints-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
