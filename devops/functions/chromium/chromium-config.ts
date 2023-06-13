import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';

export const ChromiumFunction = {
  handler: `devops/functions/chromium/handler.main`,
  role: 'chromiumLambdaRole',
  timeout: 10,
  vpc: {
    securityGroupIds: [getAttribute('chromiumSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      httpApi: {
        method: 'ANY',
        path: '/chromium/{proxy+}',
      },
    },
  ],
};

export const ChromiumLambdaResources = {
  chromiumLambdaRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: getResourceName('chromiumLambdaRole'),
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
          PolicyName: 'chromiumLambdaPolicy',
          PolicyDocument: {
            Statement: [...CloudwatchPolicies, ...EniPolicies],
          },
        },
      ],
    },
  },
  chromiumSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-chromium-lambda'),
      GroupDescription: getResourceName('sg-chromium-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
