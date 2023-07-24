import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';

export const ExplorerLambdaFunction = {
  handler: `devops/functions/explorer/handler.main`,
  role: 'ExplorerLambdaRole',
  timeout: 10,
  vpc: {
    securityGroupIds: [getAttribute('ExplorerSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      httpApi: {
        method: 'GET',
        path: '/explorer/admin',
      },
    },
    {
      httpApi: {
        method: 'GET',
        path: '/explorer',
      },
    },
    {
      httpApi: {
        method: 'GET',
        path: '/set-header',
      },
    },
  ],
};

export const ExplorerLambdaResources = {
  ExplorerLambdaRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: getResourceName('ExplorerLambdaRole'),
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
          PolicyName: 'ExplorerLambdaPolicy',
          PolicyDocument: {
            Statement: [...CloudwatchPolicies, ...EniPolicies],
          },
        },
      ],
    },
  },
  ExplorerSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-explorer-lambda'),
      GroupDescription: getResourceName('sg-explorer-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
