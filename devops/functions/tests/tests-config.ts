import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { CognitoUpdateAttributesPolicyBasedOnOutputArn } from '../../serverless/cognito';
import { S3PoliciesWithImport } from '../../serverless/s3';
import { SMSPolicy } from '../../serverless/sns';
import { getAttribute, getResourceName, importOutput } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

export const TestsFunction = {
  handler: `devops/functions/tests/handler.main`,
  role: 'TestsLambdaRole',
  timeout: 10,
  vpc: {
    securityGroupIds: [getAttribute('TestsSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  // enabled: '${self:custom.testFunctions.${self:provider.stage}}',
  events: [
    {
      httpApi: {
        method: 'POST',
        path: '/tests/{proxy+}',
      },
    },
  ],
};

export const TestsLambdaResources = {
  TestsLambdaRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: getResourceName('TestsLambdaRole'),
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
          PolicyName: 'TestsLambdaPolicy',
          PolicyDocument: {
            Statement: [
              ...CloudwatchPolicies,
              ...EniPolicies,
              ...S3PoliciesWithImport,
              ...CognitoUpdateAttributesPolicyBasedOnOutputArn,
              ...SQSSendPolicy,
              SMSPolicy,
              {
                Effect: 'Allow',
                Action: ['cognito-idp:*'],
                Resource: importOutput('CognitoUserPoolArn'),
              },
            ],
          },
        },
      ],
    },
  },
  TestsSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-tests-lambda'),
      GroupDescription: getResourceName('sg-tests-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
