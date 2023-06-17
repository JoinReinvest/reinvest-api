import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { CognitoAuthorizerName, CognitoUpdateAttributesPolicyBasedOnOutputArn } from '../../serverless/cognito';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { SMSPolicy } from '../../serverless/sns';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

export const ApiLambdaFunction = {
  handler: `devops/functions/api/handler.main`,
  role: 'ApiLambdaRole',
  timeout: 30,
  vpc: {
    securityGroupIds: [getAttribute('ApiSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [
    {
      httpApi: {
        method: 'POST',
        path: '/api',
        authorizer: {
          name: CognitoAuthorizerName,
        },
      },
    },
  ],
};

export const ApiLambdaResources = {
  ApiLambdaRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: getResourceName('ApiLambdaRole'),
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
          PolicyName: 'ApiLambdaPolicy',
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
  ApiSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-api-lambda'),
      GroupDescription: getResourceName('sg-api-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
