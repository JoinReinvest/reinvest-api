import { CloudwatchPolicies } from '../../serverless/cloudwatch';
import { getAttribute, getResourceName } from '../../serverless/utils';
import { EniPolicies, importPrivateSubnetRefs, importVpcRef, SecurityGroupEgressRules, SecurityGroupIngressRules } from '../../serverless/vpc';
import { SQSSendPolicy } from '../queue/queue-config';

const cognitoUserPool: {
  cognitoUserPool: {
    pool: string;
    trigger: 'PreSignUp';
    existing?: boolean;
    forceDeploy?: boolean;
  };
} = {
  cognitoUserPool: {
    pool: 'reinvest-user-pool-${sls:stage}',
    trigger: 'PreSignUp',
    existing: true,
    forceDeploy: true,
  },
};

export const cognitoPreSignUpFunction = {
  handler: `devops/functions/preSignUp/handler.main`,
  role: 'CognitoPreSignUpLambdaRole',
  vpc: {
    securityGroupIds: [getAttribute('PreSignUpSecurityGroup', 'GroupId')],
    subnetIds: [...importPrivateSubnetRefs()],
  },
  events: [cognitoUserPool],
};
export const CognitoPreSignUpResources = {
  CognitoPreSignUpLambdaRole: {
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
          PolicyName: 'PreSignUpLambdaPolicy',
          PolicyDocument: {
            Statement: [...CloudwatchPolicies, ...EniPolicies, ...SQSSendPolicy],
          },
        },
      ],
    },
  },
  PreSignUpSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-presignup-lambda'),
      GroupDescription: getResourceName('sg-presignup-lambda'),
      SecurityGroupIngress: SecurityGroupIngressRules,
      SecurityGroupEgress: SecurityGroupEgressRules,
      VpcId: importVpcRef(),
    },
  },
};
