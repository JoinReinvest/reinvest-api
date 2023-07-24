import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { CognitoAuthorizerName, CognitoUpdateAttributesPolicyBasedOnOutputArn } from '../../serverless/cognito';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { SMSPolicy } from '../../serverless/sns';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

export const AdminLambdaFunction = {
  handler: `devops/functions/admin/handler.main`,
  role: 'AdminLambdaRole',
  timeout: 10,
  vpc: {
    securityGroupIds: [getAttribute('AdminSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      httpApi: {
        method: 'POST',
        path: '/${sls:stage}/api/admin',
        authorizer: {
          name: CognitoAuthorizerName,
        },
      },
    },
  ],
};

export const AdminLambdaResources = {
  AdminLambdaRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: getResourceName('AdminLambdaRole'),
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
          PolicyName: 'AdminLambdaPolicy',
          PolicyDocument: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
              ...S3PoliciesWithImport,
              ...CognitoUpdateAttributesPolicyBasedOnOutputArn,
              ...SQSSendPolicy,
              SMSPolicy,
            ],
          },
        },
      ],
    },
  },
  AdminSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-admin-lambda'),
      GroupDescription: getResourceName('sg-admin-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
