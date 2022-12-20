import {EniPolicies, getPrivateSubnetRefs, getVpcRef} from "../../serverless/vpc";
import {CognitoAuthorizerName} from "../../serverless/cognito";
import {getAttribute, getResourceName} from "../../serverless/utils";
import {S3Policies} from "../../serverless/s3";
import {CloudwatchPolicies} from "../../serverless/cloudwatch";

export const ApiLambdaFunction = {
    handler: `devops/functions/api/handler.main`,
    role: 'ApiLambdaRole',
    timeout: 10,
    vpc: {
        securityGroupIds: [
            getAttribute('ApiSecurityGroup', 'GroupId')
        ],
        subnetIds: [...getPrivateSubnetRefs()]
    },
    events: [
        {
            httpApi: {
                method: 'ANY',
                path: '/',
                authorizer: {
                    name: CognitoAuthorizerName
                }
            },
        }
    ],
}

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
                            ...S3Policies,
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
            SecurityGroupEgress: [
                {
                    IpProtocol: 'TCP',
                    CidrIp: '0.0.0.0/0',
                    ToPort: 443,
                    FromPort: 443,
                },
                {
                    IpProtocol: 'TCP',
                    CidrIp: '0.0.0.0/0',
                    ToPort: 5432,
                    FromPort: 5432,
                }
            ],
            VpcId: getVpcRef()
        }
    },
}