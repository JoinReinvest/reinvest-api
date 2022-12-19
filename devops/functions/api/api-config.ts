import {getPrivateSubnetRefs, getVpcRef} from "../../serverless/vpc";
import {CognitoAuthorizerName} from "../../serverless/cognito";
import {getResourceName, getResourceNameTag} from "../../serverless/utils";

export const ApiLambdaFunction = {
    handler: `devops/functions/api/handler.main`,
    role: 'ApiLambdaRole',
    timeout: 10,
    vpc: {
        securityGroupIds: [
            {'Fn::GetAtt': ['ApiSecurityGroup', 'GroupId']}
        ],
        subnetIds: [...getPrivateSubnetRefs()]
    },
    events: [
        {
            httpApi: {
                method: 'ANY',
                path: '/',
                // authorizer: {
                //     name: CognitoAuthorizerName
                // }
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
                            {
                                Effect: 'Allow',
                                Action: ['logs:CreateLogStream', 'logs:CreateLogGroup', 'logs:PutLogEvents'],
                                Resource: 'arn:aws:logs:*:*:*',
                            },
                            {   // allow to create ENI to access VPC
                                Effect: 'Allow',
                                Action: ['ec2:CreateNetworkInterface', 'ec2:DeleteNetworkInterface', 'ec2:AssignPrivateIpAddresses', 'ec2:UnassignPrivateIpAddresses'],
                                Resource: 'arn:aws:ec2:*:*:*',
                            },
                            {   // allow to describe ENI (works only on all Resources -https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html)
                                Effect: 'Allow',
                                Action: ['ec2:DescribeNetworkInterfaces'],
                                Resource: '*',
                            },
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